using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy_Management_System.Models;
using System.Collections.Generic;
using System.Linq;

namespace Pharmacy_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SupplierController : ControllerBase
    {
        private readonly ProjectContext _context;

        public SupplierController(ProjectContext context)
        {
            _context = context;
        }

        // 1. GET: Get all suppliers
        // Retrieve all supplier information
        [Authorize(Roles = "1,2")]
        [HttpGet("GetSuppliers")]
        public IActionResult GetSuppliers()
        {
            List<Supplier> suppliers = _context.Suppliers.ToList();
            return Ok(suppliers);
        }

        // 2. GET: Get supplier by Id
        // Find specific supplier using SupplierId
        [Authorize(Roles = "1,2")]
        [HttpGet("GetSupplierById/{id}")]
        public IActionResult GetSupplierById(int id)
        {
            var supplier = _context.Suppliers.Find(id);

            if (supplier == null)
            {
                return NotFound($"Supplier with ID {id} was not found.");
            }

            return Ok(supplier);
        }

        // 3. POST: Create new supplier
        // Add new supplier record
        [Authorize(Roles = "1,2")]
        [HttpPost("CreateSupplier")]
        public IActionResult CreateSupplier([FromBody] Supplier supplier)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Suppliers.Add(supplier);
            _context.SaveChanges();

            return CreatedAtAction(
                nameof(GetSupplierById),
                new { id = supplier.SupplierId },
                supplier
            );
        }

        // 4. PUT: Update supplier
        // Modify supplier information
        [Authorize(Roles = "1,2")]
        [HttpPut("UpdateSupplier/{id}")]
        public IActionResult UpdateSupplier(int id, [FromBody] Supplier supplier)
        {
            if (id != supplier.SupplierId)
            {
                return BadRequest("ID mismatch.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingSupplier = _context.Suppliers.Find(id);

            if (existingSupplier == null)
            {
                return NotFound($"Supplier with ID {id} was not found.");
            }

            _context.Entry(existingSupplier).CurrentValues.SetValues(supplier);
            _context.SaveChanges();

            return NoContent();
        }

        // 5. DELETE: Delete supplier
        // Remove supplier from database
        [Authorize(Roles = "1,2")]
        [HttpDelete("DeleteSupplier/{id}")]
        public IActionResult DeleteSupplier(int id)
        {
            var supplier = _context.Suppliers.Find(id);

            if (supplier == null)
            {
                return NotFound($"Supplier with ID {id} was not found.");
            }

            _context.Suppliers.Remove(supplier);
            _context.SaveChanges();

            return NoContent();
        }

        // 6. GET: Search supplier by name
        // Filter suppliers using LINQ
        [Authorize(Roles = "1,2")]
        [HttpGet("search/{name}")]
        public IActionResult SearchSupplier(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Search name cannot be empty.");
            }

            var suppliers = _context.Suppliers
                .Where(x => x.SupplierName.ToLower().Contains(name.ToLower()))
                .ToList();

            return Ok(suppliers);
        }
    }
}