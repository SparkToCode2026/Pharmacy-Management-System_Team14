using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy_Management_System.Models;
using System.Collections.Generic;
using System.Linq;

namespace Pharmacy_Management_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ManufacturerController : ControllerBase
    {
        private readonly ProjectContext _context;

        public ManufacturerController(ProjectContext context)
        {
            _context = context;
        }

        // Create a new manufacturer (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPost("CreateManufacturer")]
        public IActionResult CreateManufacturer([FromBody] Manufacturer manufacturer)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            bool manuExists = _context.Manufacturer
                .Any(m => m.ManufacturerName == manufacturer.ManufacturerName || m.LicenseNumber == manufacturer.LicenseNumber);

            if (manuExists)
            {
                return BadRequest("Manufacturer Name or License Number is already taken.");
            }

            _context.Manufacturer.Add(manufacturer);
            _context.SaveChanges();

            return Ok(manufacturer);
        }

        // Update a manufacturer (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPut("UpdateManufacturer/{id}")]
        public IActionResult UpdateManufacturer(int id, [FromBody] Manufacturer manufacturer)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var manu = _context.Manufacturer.Find(id);
            if (manu == null)
            {
                return NotFound($"Manufacturer with ID {id} was not found.");
            }

            manu.ManufacturerName = manufacturer.ManufacturerName;
            manu.LicenseNumber = manufacturer.LicenseNumber;
            manu.ContactNumber = manufacturer.ContactNumber;
            manu.ContactEmail = manufacturer.ContactEmail;

            _context.SaveChanges();
            return Ok(manu);
        }

        // Update contact info only (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPatch("UpdateManufacturerContact/{id}")]
        public IActionResult UpdateContactManufacturer(int id, [FromBody] string newContactInfo)
        {
            if (string.IsNullOrWhiteSpace(newContactInfo))
            {
                return BadRequest("Contact information cannot be empty.");
            }

            var manu = _context.Manufacturer.Find(id);
            if (manu == null)
            {
                return NotFound($"Manufacturer with ID {id} was not found.");
            }

            manu.ContactNumber = newContactInfo;
            _context.SaveChanges();

            return Ok(manu);
        }

        // Delete a manufacturer (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpDelete("DeleteManufacturer/{id}")]
        public IActionResult DeleteManufacturer(int id)
        {
            var manu = _context.Manufacturer.Find(id);
            if (manu == null)
            {
                return NotFound($"Manufacturer with ID {id} was not found.");
            }

            _context.Manufacturer.Remove(manu);
            _context.SaveChanges();

            return Ok("Manufacturer deleted successfully.");
        }

        // Get all manufacturers (Public access)
        [AllowAnonymous]
        [HttpGet("GetAllManufacturers")]
        public IActionResult GetAllManufacturer()
        {
            List<Manufacturer> manufacturers = _context.Manufacturer
                .Include(m => m.Medicines)
                .ToList();

            return Ok(manufacturers);
        }

        // Get manufacturer by ID (Public access)
        [AllowAnonymous]
        [HttpGet("GetManufacturerById/{id}")]
        public IActionResult GetManufacturer(int id)
        {
            var manu = _context.Manufacturer
                .Include(m => m.Medicines)
                .FirstOrDefault(m => m.ManufacturerId == id);

            if (manu == null)
            {
                return NotFound($"Manufacturer with ID {id} was not found.");
            }

            return Ok(manu);
        }

        // Search manufacturers by name (Public access)
        [AllowAnonymous]
        [HttpGet("SearchManufacturer")]
        public IActionResult SearchManufacturer([FromQuery] string? name)
        {
            var query = _context.Manufacturer
                .Include(m => m.Medicines)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(m => m.ManufacturerName.ToLower().Contains(name.ToLower()));
            }

            List<Manufacturer> manufacturers = query.ToList();
            return Ok(manufacturers);
        }

        // Count manufacturers (Public access)
        [AllowAnonymous]
        [HttpGet("count")]
        public IActionResult Count()
        {
            int count = _context.Manufacturer.Count();
            return Ok(new { TotalManufacturers = count });
        }
    }
}