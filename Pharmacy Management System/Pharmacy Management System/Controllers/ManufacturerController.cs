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
        [HttpPost("CreateManufacturer")]
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

        [HttpPut("UpdateManufacturer")]
        public IActionResult UpdateManufacturer(int id, [FromBody] Manufacturer manufacturer)
        {
            //Check if the manufacturer exists in the database
            var manu = _context.Manufacturer.Find(id);
            if (manu == null)
            {
                return NotFound();
            }
            manu.ManufacturerName = manufacturer.ManufacturerName;
            manu.LicenseNumber = manufacturer.LicenseNumber;

            _context.SaveChanges();
            return Ok(manu);
        }



        //Update the contact information of a manufacturer
        [HttpPatch("UpdateManufacturerContact")]
        public IActionResult UpdateContactManufacturer(int id, [FromBody] string newContactInfo)
        {
            //Check if the manufacturer exists in the database
            var manu = _context.Manufacturer.Find(id);
            if (manu == null)
            {
                return NotFound();
            }
            manu.ContactNumber = newContactInfo;
            _context.SaveChanges();
            return Ok(manu);
        }



        //Delete a manufacturer
        [HttpDelete("DeleteManufacturer")]
        public IActionResult DeleteManufacturer(int id)
        {
            //Check if the manufacturer exists in the database
            var manu = _context.Manufacturer.Find(id);
            if (manu == null)
            {
                return NotFound();
            }
            _context.Manufacturer.Remove(manu);
            _context.SaveChanges();
            return Ok();
        }


        //Get all manufacturers with their medicines
        [HttpGet("GetAllManufacturers")]
        public IActionResult GetAllManufacturer()
        {
            //Get all manufacturers with their medicines
            var manufacturers = _context.Manufacturer.
                                                Include(m => m.Medicines)
                                                .ToList();
            return Ok(manufacturers);
        }



        //Get a manufacturer by id with their medicines
        [HttpGet("GetManufacturerById")]
        public IActionResult GetManufacturer(int id)
        {
            //Check if the manufacturer exists in the database
            var manu = _context.Manufacturer
                                 .Include(m => m.Medicines)
                                 .FirstOrDefault(m => m.ManufacturerId == id);
            if (manu == null)
            {
                return NotFound();
            }
            return Ok(manu);
        }


        //Search for manufacturers by name
        [HttpGet("SearchManufacturer")]
        public IActionResult SearchManufacturer([FromQuery] string? name)
        {
            //Search for manufacturers by name
            var query = _context.Manufacturer
                        .Include(m => m.Medicines)
                        .AsQueryable();
            //If the name is not null or empty, filter the manufacturers by name
            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(m => m.ManufacturerName.Contains(name));
            }
            var manufacturers = query.ToList();
            return Ok(manufacturers);
        }



        //Get the count of manufacturers
        [HttpGet("count")]
        public IActionResult Count()
        {
            var count = _context.Manufacturer.Count();
            return Ok(count);
        }
    }
}

