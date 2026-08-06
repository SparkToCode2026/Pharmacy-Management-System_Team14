using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy_Management_System.Models;

namespace Pharmacy_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupplierController : ControllerBase
    {
        private readonly ProjectContext _context;


        public SupplierController(ProjectContext context)
        {
            _context = context;
        }



        // 1. GET: Get all suppliers
        // Retrieve all supplier information
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Supplier>>> GetSuppliers()
        {
            return await _context.Suppliers.ToListAsync();
        }




        // 2. GET: Get supplier by Id
        // Find specific supplier using SupplierId
        [HttpGet("{id}")]
        public async Task<ActionResult<Supplier>> GetSupplierById(int id)
        {
            var supplier = await _context.Suppliers
                .FindAsync(id);


            if (supplier == null)
            {
                return NotFound();
            }


            return supplier;
        }





        // 3. POST: Create new supplier
        // Add new supplier record
        [HttpPost]
        public async Task<ActionResult<Supplier>> CreateSupplier(Supplier supplier)
        {
            _context.Suppliers.Add(supplier);

            await _context.SaveChangesAsync();


            return CreatedAtAction(nameof(GetSupplierById),
                new { id = supplier.SupplierId },
                supplier);
        }





        // 4. PUT: Update supplier
        // Modify supplier information
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSupplier(int id, Supplier supplier)
        {
            if (id != supplier.SupplierId)
            {
                return BadRequest();
            }


            _context.Entry(supplier).State = EntityState.Modified;


            await _context.SaveChangesAsync();


            return NoContent();
        }





        // 5. DELETE: Delete supplier
        // Remove supplier from database
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSupplier(int id)
        {
            var supplier = await _context.Suppliers
                .FindAsync(id);


            if (supplier == null)
            {
                return NotFound();
            }


            _context.Suppliers.Remove(supplier);


            await _context.SaveChangesAsync();


            return NoContent();
        }




        // 6. GET: Search supplier by name
        // Filter suppliers using LINQ
        [HttpGet("search/{name}")]
        public async Task<ActionResult<IEnumerable<Supplier>>> SearchSupplier(string name)
        {
            var suppliers = await _context.Suppliers
                .Where(x => x.SupplierName.Contains(name))
                .ToListAsync();


            return suppliers;
        }

    }
}
