using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy_Management_System.Models;

namespace Pharmacy_Management_System.Controllers
{
    [ApiController]
    [Route("StockLevel")]
    public class StockLevelController : ControllerBase
    {
        private ProjectContext _context;
        public StockLevelController(ProjectContext context)
        {
            _context = context;
        }

        //Create a new stock level entry
        [HttpPost("CreateStockLevel")]
        public IActionResult CreateStockLevel([FromBody] StockLevel stockLevel)
        {
            _context.StockLevel.Add(stockLevel);
            _context.SaveChanges();
            return Ok(stockLevel);
        }

        //Update stock quantity and reorder level
        [HttpPut("UpdateStockLevel")]
        public IActionResult UpdateStockLevel(int id, [FromBody] StockLevel stockLevel)
        {
            var stock = _context.StockLevel.Find(id);
            if (stock == null)
            {
                return NotFound();
            }
            stock.CurrentQuantity = stockLevel.CurrentQuantity;
            stock.ReorderLevel = stockLevel.ReorderLevel;

            _context.SaveChanges();
            return Ok(stock);
        }

        //Restock quantity and update the last restocked date
        [HttpPatch("restock")]
        public IActionResult Restock(int id, [FromBody] int quantityAdded)
        {
            var stock = _context.StockLevel.Find(id);
            if (stock == null)
            {
                return NotFound();
            }
            stock.CurrentQuantity += quantityAdded;
            stock.LastRestockedDate = DateTime.Now;
            _context.SaveChanges();
            return Ok(stock);
        }

        //Delete stock level entry
        [HttpDelete("DeleteStockLevel")]
        public IActionResult DeleteStockLevel(int id)
        {
            var stock = _context.StockLevel.Find(id);
            if (stock == null)
            {
                return NotFound();
            }
            _context.StockLevel.Remove(stock);
            _context.SaveChanges();
            return Ok();
        }

        //Get stock records with corresponding medicine and branch
        [HttpGet("GetAllStockLevels")]
        public IActionResult GetAllStockLevels()
        {
            var stockLevels = _context.StockLevel
                                       .Include(s => s.Medicine)
                                       .Include(s => s.Branch)
                                       .ToList();
            return Ok(stockLevels);
        }

        //Get a stock level by id with their medicine and branch
        [HttpGet("GetStockLevel")]
        public IActionResult GetStockLevel(int id)
        {
            var stock = _context.StockLevel
                                 .Include(s => s.Medicine)
                                 .Include(s => s.Branch)
                                 .FirstOrDefault(s => s.StockLevelId == id);
            if (stock == null)
            {
                return NotFound();
            }
            return Ok(stock);
        }

        //Filter items where Current Quantity is at or below ReorderLevel
        [HttpGet("low-stock")]
        public IActionResult GetLowStock()
        {
            var lowStock = _context.StockLevel
                                    .Include(s => s.Medicine)
                                    .Include(s => s.Branch)
                                    .Where(s => s.CurrentQuantity <= s.ReorderLevel)
                                    .ToList();
            return Ok(lowStock);
        }

        //Sort stock levels by total quantity and quantity per branch
        [HttpGet("summary")]
        public IActionResult GetStockSummary()
        {
            var sorted = _context.StockLevel
                                  .OrderBy(s => s.CurrentQuantity)
                                  .ToList();
            var totalPerBranch = _context.StockLevel
                                          .GroupBy(s => s.BranchId)
                                          .Select(g => new { BranchId = g.Key, TotalQuantity = g.Sum(s => s.CurrentQuantity) })
                                          .ToList();
            return Ok(new { SortedByQuantity = sorted, TotalPerBranch = totalPerBranch });
        }
    }
}