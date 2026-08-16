using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy_Management_System.Models;
using Pharmacy_Management_System.Services;
using System.Security.Claims;

namespace Pharmacy_Management_System.Controllers
{
    // Developer 4 - Amal. Closes issue #34.
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly ProjectContext _context;
        private readonly IEmailService _emailService;


        public OrderController(ProjectContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // CASE 1 - POST: create a new order with its order items.
        [HttpPost("CreateOrder")]
        public async Task<ActionResult<Order>> CreateOrder(Order order)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("User ID not found in token.");
            }

            order.UserId = int.Parse(userIdClaim);

            ModelState.Remove("UserId");
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (order.OrderItems == null || order.OrderItems.Count == 0)
            {
                return BadRequest("An order must contain at least one order item.");
            }

            var userExists = await _context.Users.AnyAsync(u => u.UserId == order.UserId);
            if (!userExists)
            {
                return BadRequest($"User {order.UserId} does not exist.");
            }

            foreach (var item in order.OrderItems)
            {
                var medicine = await _context.Medicines
                    .FirstOrDefaultAsync(m => m.MedicineId == item.MedicineId);

                if (medicine == null)
                {
                    return BadRequest($"Medicine {item.MedicineId} does not exist.");
                }

                if (item.Quantity <= 0)
                {
                    return BadRequest("Quantity must be greater than 0.");
                }

                if (item.UnitPrice <= 0)
                {
                    item.UnitPrice = (decimal)medicine.MedicinePrice;
                }

                item.RecalculateSubtotal();

                // Deduct stock for this medicine at the order's branch
                var stock = await _context.StockLevel
                    .FirstOrDefaultAsync(s => s.MedicineId == item.MedicineId );

                if (stock != null)
                {
                    if (stock.CurrentQuantity < item.Quantity)
                    {
                        return BadRequest($"Insufficient stock for '{medicine.MedicineName}' at the selected branch. Available: {stock.CurrentQuantity}, Requested: {item.Quantity}.");
                    }
                    stock.CurrentQuantity -= item.Quantity;
                }
                else
                {
                    // Fallback to any branch stock record for this medicine
                    var anyStock = await _context.StockLevel
                        .FirstOrDefaultAsync(s => s.MedicineId == item.MedicineId);

                    if (anyStock != null)
                    {
                        if (anyStock.CurrentQuantity < item.Quantity)
                        {
                            return BadRequest($"Insufficient stock for '{medicine.MedicineName}'. Available: {anyStock.CurrentQuantity}, Requested: {item.Quantity}.");
                        }
                        anyStock.CurrentQuantity -= item.Quantity;
                    }

                }
                if (stock != null && stock.CurrentQuantity < 50)
                {

                    var receiptBody =
                        $"Hello,\n\n" +
                        $"Low Stock Alert\n\n" +
                        $"Medicine: {medicine.MedicineName}\n" +
                        $"Medicine ID: {medicine.MedicineId}\n" +
                        $"Current Quantity: {stock.CurrentQuantity}\n" +      
                        $"Please place a replenishment order to avoid stockout.\n\n" +
                        $"Generated at: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC\n\n" +
                        $"Regards,\nPharmacy Management System";

                    await _emailService.SendEmailAsync(
                        "haifi112233@gmail.com", "confirmation of low stock",
                        receiptBody);
                }
            }


            order.OrderDate = DateTime.Now;
            order.Status = "Pending";
            order.RecalculateTotal();

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == order.UserId);
            if (user != null && !string.IsNullOrWhiteSpace(user.Email))
            {
                var emailBody =
                    $"Hello {user.Username},\n\n" +
                    $"Thank you for your order.\n\n" +
                    $"Order Number: {order.OrderId}\n" +
                    $"Order Date: {order.OrderDate:g}\n" +
                    $"Total Amount: {order.TotalAmount:F2} $\n" +
                    $"Status: {order.Status}\n\n" +
                    $"Thank you for choosing our pharmacy.";
                await _emailService.SendEmailAsync(user.Email, $"Order Confirmation - Order #{order.OrderId}", emailBody);



            }



            return CreatedAtAction(nameof(GetOrderById), new { id = order.OrderId }, order);
        }

        // CASE 2 - PUT: update an existing order (Admin / Pharmacist).
        [Authorize(Roles = "1,2")]
        [HttpPut("UpdateOrder")]
        public async Task<IActionResult> UpdateOrder(int id, Order updated)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound("Order " + id + " was not found.");
            }

            if (order.Status == "Completed" || order.Status == "Cancelled")
            {
                return BadRequest("A " + order.Status + " order can no longer be edited.");
            }

            var userExists = await _context.Users.AnyAsync(u => u.UserId == updated.UserId);
            if (!userExists)
            {
                return BadRequest("User " + updated.UserId + " does not exist.");
            }

            order.UserId = updated.UserId;
            order.OrderDate = updated.OrderDate;
            order.RecalculateTotal();

            await _context.SaveChangesAsync();
            return Ok(order);
        }

        // CASE 3 - PATCH: update order status (Admin / Pharmacist).
        [Authorize(Roles = "1,2")]
        [HttpPatch("UpdateOrderStatus")]
        public async Task<IActionResult> UpdateOrderStatus(int id, string status)
        {
            string[] allowed = { "Pending", "Confirmed", "Preparing", "Ready", "Completed", "Cancelled" };

            if (!allowed.Contains(status))
            {
                return BadRequest("Status must be one of: " + string.Join(", ", allowed));
            }

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound("Order " + id + " was not found.");
            }

            if (order.Status == "Completed")
            {
                return BadRequest("A completed order cannot change status.");
            }

            // Restore stock if order is being cancelled
            if (order.Status != "Cancelled" && status == "Cancelled" && order.OrderItems != null)
            {
                foreach (var item in order.OrderItems)
                {
                    var stock = await _context.StockLevel
                        .FirstOrDefaultAsync(s => s.MedicineId == item.MedicineId && s.BranchId == order.BranchId);
                    if (stock != null)
                    {
                        stock.CurrentQuantity += item.Quantity;
                    }
                }
            }
            // Re-deduct stock if order is un-cancelled
            else if (order.Status == "Cancelled" && status != "Cancelled" && order.OrderItems != null)
            {
                foreach (var item in order.OrderItems)
                {
                    var stock = await _context.StockLevel
                        .FirstOrDefaultAsync(s => s.MedicineId == item.MedicineId && s.BranchId == order.BranchId);
                    if (stock != null)
                    {
                        stock.CurrentQuantity = Math.Max(0, stock.CurrentQuantity - item.Quantity);
                    }
                }
            }

            order.Status = status;
            await _context.SaveChangesAsync();

            return Ok(order);
        }

        // CASE 4 - DELETE: delete an order (Admin / Pharmacist).
        [Authorize(Roles = "1,2")]
        [HttpDelete("DeleteOrder")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound("Order " + id + " was not found.");
            }

            // Restore stock if order was active when deleted
            if (order.Status != "Cancelled" && order.OrderItems != null)
            {
                foreach (var item in order.OrderItems)
                {
                    var stock = await _context.StockLevel
                        .FirstOrDefaultAsync(s => s.MedicineId == item.MedicineId && s.BranchId == order.BranchId);
                    if (stock != null)
                    {
                        stock.CurrentQuantity += item.Quantity;
                    }
                }
            }

            _context.OrderItems.RemoveRange(order.OrderItems);
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // CASE 5 - GET (list): all orders (Admin / Pharmacist).
        [Authorize(Roles = "1,2")]
        [HttpGet("GetAllOrders")]
        public async Task<ActionResult<IEnumerable<Order>>> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Medicine)
                .Include(o => o.User)
                .ToListAsync();

            return Ok(orders);
        }

        // Get logged-in user's orders
        [HttpGet("MyOrders")]
        public async Task<ActionResult<IEnumerable<Order>>> GetMyOrders()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized();
            }

            int userId = int.Parse(userIdClaim);

            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Medicine)
                .Where(o => o.UserId == userId)
                .ToListAsync();

            return Ok(orders);
        }

        // CASE 6 - GET (find): a single order by id.
        [HttpGet("GetOrderById")]
        public async Task<ActionResult<Order>> GetOrderById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Medicine)
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound("Order " + id + " was not found.");
            }

            return Ok(order);
        }

        // CASE 7 - GET (filter): filter orders using LINQ Where() (Admin / Pharmacist).
        [Authorize(Roles = "1,2")]
        [HttpGet("FilterOrders")]
        public async Task<ActionResult<IEnumerable<Order>>> FilterOrders(
            string? status, int? userId, DateTime? fromDate, DateTime? toDate, string? username)
        {
            var query = _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.User)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(o => o.Status == status);
            }

            if (userId.HasValue)
            {
                query = query.Where(o => o.UserId == userId.Value);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(o => o.OrderDate >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(o => o.OrderDate <= toDate.Value);
            }

            if (!string.IsNullOrWhiteSpace(username))
            {
                query = query.Where(o => o.User!.Username.Contains(username));
            }

            var results = await query.ToListAsync();
            return Ok(results);
        }

        // CASE 8 - GET (sort + aggregate): sales summary (Admin / Pharmacist).
        [Authorize(Roles = "1,2")]
        [HttpGet("sales-summary")]
        public async Task<IActionResult> GetSalesSummary()
        {
            var orders = await _context.Orders
                .Where(o => o.Status != "Cancelled")
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var summary = new
            {
                TotalOrders = orders.Count,
                TotalSales = orders.Sum(o => o.TotalAmount),
                AverageOrderValue = orders.Count == 0
                    ? 0m
                    : Math.Round(orders.Average(o => o.TotalAmount), 2),
                HighestOrderValue = orders.Count == 0 ? 0m : orders.Max(o => o.TotalAmount),

                ByStatus = orders
                    .GroupBy(o => o.Status)
                    .Select(g => new
                    {
                        Status = g.Key,
                        Count = g.Count(),
                        Revenue = g.Sum(o => o.TotalAmount)
                    })
                    .ToList(),

                RecentOrders = orders.Take(10).ToList()
            };

            return Ok(summary);
        }
    }
}