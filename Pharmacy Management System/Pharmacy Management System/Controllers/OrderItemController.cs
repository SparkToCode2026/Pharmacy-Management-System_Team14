using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy_Management_System.Models;

namespace Pharmacy_Management_System.Controllers
{
    // Developer 4 - Amal. Closes issue #34.
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrderItemController : ControllerBase
    {
        private readonly ProjectContext _context;

        public OrderItemController(ProjectContext context)
        {
            _context = context;
        }

        // CASE 1 - POST: Add a new order item to an existing order.
        [HttpPost("CreateOrderItem")]
        public async Task<ActionResult<OrderItem>> CreateOrderItem(OrderItem item)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var order = await _context.Orders.FindAsync(item.OrderId);
            if (order == null)
            {
                return BadRequest($"Order {item.OrderId} does not exist.");
            }

            if (order.Status == "Completed" || order.Status == "Cancelled")
            {
                return BadRequest($"Cannot add items to a {order.Status} order.");
            }

            var medicine = await _context.Medicines.FindAsync(item.MedicineId);
            if (medicine == null)
            {
                return BadRequest($"Medicine {item.MedicineId} does not exist.");
            }

            if (item.Quantity <= 0)
            {
                return BadRequest("Quantity must be greater than 0.");
            }

            item.RecalculateSubtotal();
            _context.OrderItems.Add(item);

            order.RecalculateTotal();
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOrderItemById), new { id = item.OrderItemId }, item);
        }

        // CASE 2 - PUT: Update an existing order item completely.
        [Authorize(Roles = "1,2")]
        [HttpPut("UpdateOrderItem")]
        public async Task<IActionResult> UpdateOrderItem(int id, OrderItem updatedItem)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var item = await _context.OrderItems
                .Include(i => i.Order)
                .FirstOrDefaultAsync(i => i.OrderItemId == id);

            if (item == null)
            {
                return NotFound($"OrderItem {id} was not found.");
            }

            if (item.Order.Status == "Completed" || item.Order.Status == "Cancelled")
            {
                return BadRequest($"A {item.Order.Status} order item can no longer be edited.");
            }

            item.Quantity = updatedItem.Quantity;
            item.MedicineId = updatedItem.MedicineId;
            item.RecalculateSubtotal();

            item.Order.RecalculateTotal();

            await _context.SaveChangesAsync();
            return Ok(item);
        }

        // CASE 3 - PATCH: Distinct update to change only the quantity.
        [HttpPatch("UpdateQuantity")]
        public async Task<IActionResult> UpdateQuantity(int id, int quantity)
        {
            if (quantity <= 0)
            {
                return BadRequest("Quantity must be greater than 0.");
            }

            var item = await _context.OrderItems
                .Include(i => i.Order)
                .FirstOrDefaultAsync(i => i.OrderItemId == id);

            if (item == null)
            {
                return NotFound($"OrderItem {id} was not found.");
            }

            if (item.Order.Status == "Completed" || item.Order.Status == "Cancelled")
            {
                return BadRequest($"Cannot update items in a {item.Order.Status} order.");
            }

            item.Quantity = quantity;
            item.RecalculateSubtotal();

            item.Order.RecalculateTotal();

            await _context.SaveChangesAsync();
            return Ok(item);
        }

        // CASE 4 - DELETE: Delete a single order item.
        [Authorize(Roles = "1,2")]
        [HttpDelete("DeleteOrderItem")]
        public async Task<IActionResult> DeleteOrderItem(int id)
        {
            var item = await _context.OrderItems
                .Include(i => i.Order)
                .FirstOrDefaultAsync(i => i.OrderItemId == id);

            if (item == null)
            {
                return NotFound($"OrderItem {id} was not found.");
            }

            _context.OrderItems.Remove(item);
            item.Order.RecalculateTotal();

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // CASE 5 - GET (list): All order items with related Medicine and Order via Include().
        [Authorize(Roles = "1,2")]
        [HttpGet("GetAllOrderItems")]
        public async Task<ActionResult<IEnumerable<OrderItem>>> GetAllOrderItems()
        {
            var items = await _context.OrderItems
                .Include(i => i.Medicine)
                .Include(i => i.Order)
                .ToListAsync();

            return Ok(items);
        }

        // CASE 6 - GET (find): A single order item by id.
        [HttpGet("GetOrderItemById")]
        public async Task<ActionResult<OrderItem>> GetOrderItemById(int id)
        {
            var item = await _context.OrderItems
                .Include(i => i.Medicine)
                .Include(i => i.Order)
                .FirstOrDefaultAsync(i => i.OrderItemId == id);

            if (item == null)
            {
                return NotFound($"OrderItem {id} was not found.");
            }

            return Ok(item);
        }

        // CASE 7 - GET (filter): Filter order items using LINQ Where().
        [HttpGet("FilterOrderItems")]
        public async Task<ActionResult<IEnumerable<OrderItem>>> FilterOrderItems(
            int? orderId, int? medicineId, decimal? minSubtotal, decimal? maxSubtotal)
        {
            var query = _context.OrderItems
                .Include(i => i.Medicine)
                .Include(i => i.Order)
                .AsQueryable();

            if (orderId.HasValue)
            {
                query = query.Where(i => i.OrderId == orderId.Value);
            }

            if (medicineId.HasValue)
            {
                query = query.Where(i => i.MedicineId == medicineId.Value);
            }

            if (minSubtotal.HasValue)
            {
                query = query.Where(i => i.UnitPrice * i.Quantity >= minSubtotal.Value);
            }

            if (maxSubtotal.HasValue)
            {
                query = query.Where(i => i.UnitPrice * i.Quantity <= maxSubtotal.Value);
            }

            var results = await query.ToListAsync();
            return Ok(results);
        }

        // CASE 8 - GET (sort + aggregate): Top-selling items summary with OrderBy and GroupBy.
        [Authorize(Roles = "1,2")]
        [HttpGet("item-summary")]
        public async Task<IActionResult> GetItemSummary()
        {
            var items = await _context.OrderItems
                .Include(i => i.Medicine)
                .ToListAsync();

            var summary = new
            {
                TotalItemsSold = items.Sum(i => i.Quantity),
                TotalRevenue = items.Sum(i => i.Quantity * i.UnitPrice),

                MostOrderedMedicines = items
                    .GroupBy(i => i.Medicine != null ? i.Medicine.MedicineName : "Unknown")
                    .Select(g => new
                    {
                        MedicineName = g.Key,
                        TotalQuantity = g.Sum(i => i.Quantity),
                        TotalRevenue = g.Sum(i => i.Quantity * i.UnitPrice)
                    })
                    .OrderByDescending(g => g.TotalQuantity)
                    .Take(5)
                    .ToList()
            };

            return Ok(summary);
        }
    }
}