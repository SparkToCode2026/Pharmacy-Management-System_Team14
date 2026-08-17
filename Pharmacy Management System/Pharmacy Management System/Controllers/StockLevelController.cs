using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy_Management_System.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Pharmacy_Management_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StockLevelController : ControllerBase
    {
        private readonly ProjectContext _context;

        public StockLevelController(ProjectContext context)
        {
            _context = context;
        }

        // Create a new stock level entry (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPost("CreateStockLevel")]
        public IActionResult CreateStockLevel([FromBody] StockLevel stockLevel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.StockLevel.Add(stockLevel);
            _context.SaveChanges();
            return Ok(stockLevel);
        }

        // Update stock quantity and reorder level (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPut("UpdateStockLevel/{id}")]
        public IActionResult UpdateStockLevel(int id, [FromBody] StockLevel stockLevel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var stock = _context.StockLevel.Find(id);
            if (stock == null)
            {
                return NotFound($"Stock level entry with ID {id} was not found.");
            }

            stock.CurrentQuantity = stockLevel.CurrentQuantity;
            stock.ReorderLevel = stockLevel.ReorderLevel;

            _context.SaveChanges();
            return Ok(stock);
        }

        // Restock quantity and update the last restocked date (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPatch("restock/{id}")]
        public IActionResult Restock(int id, [FromBody] int quantityAdded)
        {
            if (quantityAdded <= 0)
            {
                return BadRequest("Restock quantity must be greater than zero.");
            }

            var stock = _context.StockLevel.Find(id);
            if (stock == null)
            {
                return NotFound($"Stock level entry with ID {id} was not found.");
            }

            stock.CurrentQuantity += quantityAdded;
            stock.LastRestockedDate = DateTime.Now;

            _context.SaveChanges();
            return Ok(stock);
        }

        // Delete stock level entry (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpDelete("DeleteStockLevel/{id}")]
        public IActionResult DeleteStockLevel(int id)
        {
            var stock = _context.StockLevel.Find(id);
            if (stock == null)
            {
                return NotFound($"Stock level entry with ID {id} was not found.");
            }

            _context.StockLevel.Remove(stock);
            _context.SaveChanges();

            return Ok("Stock level entry deleted successfully.");
        }

        // Get stock records with corresponding medicine and branch (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpGet("GetAllStockLevels")]
        public IActionResult GetAllStockLevels()
        {
            List<StockLevel> stockLevels = _context.StockLevel
                .Include(s => s.Medicine)
                .Include(s => s.Branch)
                .ToList();

            return Ok(stockLevels);
        }

        // Get a stock level by id with their medicine and branch (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpGet("GetStockLevel/{id}")]
        public IActionResult GetStockLevel(int id)
        {
            var stock = _context.StockLevel
                .Include(s => s.Medicine)
                .Include(s => s.Branch)
                .FirstOrDefault(s => s.StockLevelId == id);

            if (stock == null)
            {
                return NotFound($"Stock level entry with ID {id} was not found.");
            }

            return Ok(stock);
        }

        // Filter items where Current Quantity is at or below ReorderLevel (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpGet("low-stock")]
        public IActionResult GetLowStock()
        {
            List<StockLevel> lowStock = _context.StockLevel
                .Include(s => s.Medicine)
                .Include(s => s.Branch)
                .Where(s => s.CurrentQuantity <= s.ReorderLevel)
                .ToList();

            return Ok(lowStock);
        }

        // Sort stock levels by total quantity and quantity per branch (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpGet("summary")]
        public IActionResult GetStockSummary()
        {
            var sorted = _context.StockLevel
                .OrderBy(s => s.CurrentQuantity)
                .ToList();

            var totalPerBranch = _context.StockLevel
                .GroupBy(s => s.BranchId)
                .Select(g => new
                {
                    BranchId = g.Key,
                    TotalQuantity = g.Sum(s => s.CurrentQuantity)
                })
                .ToList();

            return Ok(new
            {
                SortedByQuantity = sorted,
                TotalPerBranch = totalPerBranch
            });
        }
    }
}