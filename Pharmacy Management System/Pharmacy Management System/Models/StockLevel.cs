namespace Pharmacy_Management_System.Models
{
    public class StockLevel
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
            [HttpPut("{id}")]
            public IActionResult UpdateStockLevel(int id, [FromBody] StockLevel stockLevel)
            {
                //Check i stock level exists in DB
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

            //Restock: add quantity and update the last restocked date
            [HttpPatch("{id}/restock")]
            public IActionResult Restock(int id, [FromBody] int quantityAdded)
            {
                //Check if stock level exists in DB
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
            [HttpDelete("{id}")]
            public IActionResult DeleteStockLevel(int id)
            {
                //Check that stock level exists in DB
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
            [HttpGet]
            public IActionResult GetAllStockLevels()
            {
                var stockLevels = _context.StockLevel
                                           .Include(s => s.Medicine)
                                           .Include(s => s.Branch)
                                           .ToList();
                return Ok(stockLevels);
            }



            //Get a stock level by id with their medicine and branch
            [HttpGet("{id}")]
            public IActionResult GetStockLevel(int id)
            {
                //Check if the stock level exists in database
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


            //Filter items where CurrentQuantity is at or below ReorderLevel
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

            //Sort stock levels by quantity and total quantity per branch
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
