using Microsoft.AspNetCore.Mvc;

namespace Pharmacy_Management_System.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ManufacturerController : ControllerBase
    {
        private ProjectContext _context;
        public ManufacturerController(ProjectContext context)
        {
            _context = context;
        }
    }
}
