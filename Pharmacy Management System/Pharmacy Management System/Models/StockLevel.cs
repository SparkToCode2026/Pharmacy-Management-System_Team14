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
        }
}
