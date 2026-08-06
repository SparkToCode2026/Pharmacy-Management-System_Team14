using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq; // optional but useful for LINQ operators like Contains, Where, OrderBy
using Pharmacy_Management_System.Models;

namespace Pharmacy_Management_System.Controllers
{
    // Developer 4 - Amal. Closes issue #34.
    // [Authorize] goes here once the JWT self-study task is merged.
    [ApiController]
    [Route("api/[controller]")]
    public class OrderItemController : ControllerBase
    {
        private readonly ProjectContext _context;

        public OrderItemController(ProjectContext context)
        {
            _context = context;
        }


        // CASE 1 - POST: create a new order with its order items.
        [HttpPost("CreateOrder")]
        public async Task<ActionResult<Order>> CreateOrder(Order order)
        {
            // Validate the order and its items before saving to the database.
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
                return BadRequest("User " + order.UserId + " does not exist.");
            }

            foreach (var item in order.OrderItems)
            {
                var medicineExists = await _context.Medicines
                    .AnyAsync(m => m.MedicineId == item.MedicineId);

                if (!medicineExists)
                {
                    return BadRequest("Medicine " + item.MedicineId + " does not exist.");
                }

                if (item.Quantity <= 0)
                {
                    return BadRequest("Quantity must be greater than 0.");
                }

                item.RecalculateSubtotal();
            }

            order.OrderDate = DateTime.Now;
            order.Status = "Pending";
            order.RecalculateTotal();

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // TODO (self-study): send the order confirmation email here
            // once the shared email service is merged.

            return CreatedAtAction(nameof(GetOrderById), new { id = order.OrderId }, order);
        }


        // CASE 2 - PUT: update an existing order.
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


        // CASE 3 - PATCH: a distinct update that only changes the order status.
        [HttpPatch("UpdateOrderStatus")]
        public async Task<IActionResult> UpdateOrderStatus(int id, string status)
        {
            string[] allowed = { "Pending", "Confirmed", "Preparing", "Ready", "Completed", "Cancelled" };

            if (!allowed.Contains(status))
            {
                return BadRequest("Status must be one of: " + string.Join(", ", allowed));
            }

            var order = await _context.Orders.FindAsync(id);

            if (order == null)
            {
                return NotFound("Order " + id + " was not found.");
            }

            if (order.Status == "Completed")
            {
                return BadRequest("A completed order cannot change status.");
            }

            order.Status = status;
            await _context.SaveChangesAsync();

            return Ok(order);
        }


        // CASE 4 - DELETE: delete an order and its items.
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

            _context.OrderItems.RemoveRange(order.OrderItems);
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        // CASE 5 - GET (list): all orders, including OrderItems and User via Include().
        [HttpGet("GetAllOrders")]
        public async Task<ActionResult<IEnumerable<Order>>> GetAllOrders()
        {
            var orders = await _context.Order
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Medicine)
                .Include(o => o.User)
                .ToListAsync();

            return Ok(orders);
        }


        // CASE 6 - GET (find): a single order by id.
        [HttpGet("GetOrderById")]
        public async Task<ActionResult<Order>> GetOrderById(int id)
        {
            var order = await _context.Order
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


        // CASE 7 - GET (filter): filter orders using LINQ Where().
        [HttpGet("FilterOrders")]
        public async Task<ActionResult<IEnumerable<Order>>> FilterOrders(
            string? status, int? userId, DateTime? fromDate, DateTime? toDate, string? username)
        {
            var query = _context.Order
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

            // Filters on a property that lives in the related User table.
            if (!string.IsNullOrWhiteSpace(username))
            {
                query = query.Where(o => o.User!.Username.Contains(username));
            }

            var results = await query.ToListAsync();
            return Ok(results);
        }


        // CASE 8 - GET (sort + aggregate): newest first, with sales totals.
        [HttpGet("sales-summary")]
        public async Task<IActionResult> GetSalesSummary()
        {
            var orders = await _context.Order
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
