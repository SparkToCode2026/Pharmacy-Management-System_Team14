using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy_Management_System.Models;

namespace Pharmacy_Management_System.Controllers
{
    [ApiController]
    [Route("Manufacturer")]
    public class ManufacturerController : ControllerBase
    {
        private ProjectContext _context;
        public ManufacturerController(ProjectContext context)
        {
            _context = context;
        }

        //Create a new manufacturer
        [HttpPost ("CreateManufacturer")]
        public IActionResult CreateManufacturer([FromBody] Manufacturer manufacturer)
        {
            bool ManuExists = _context.Manufacturer.Any(m => m.ManufacturerName == manufacturer.ManufacturerName || m.LicenseNumber == manufacturer.LicenseNumber);
            if (ManuExists)
            {
                return BadRequest("Manufacturer Name or License Number is already taken.");
            }
            _context.Manufacturer.Add(manufacturer);
            _context.SaveChanges();
            return Ok(manufacturer);
        }

    }
}

