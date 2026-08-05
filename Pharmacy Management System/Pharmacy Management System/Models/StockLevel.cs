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
        }
}
