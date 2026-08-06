using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy_Management_System.Models;

namespace Pharmacy_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrescriptionController : ControllerBase
    {
        private readonly ProjectContext _context;


        public PrescriptionController(ProjectContext context)
        {
            _context = context;
        }



        // 1. POST: Create a new Prescription
        // Create prescription record with validation
        [HttpPost("CreatePrescription")]
        public async Task<ActionResult<Prescription>> CreatePrescription(Prescription prescription)
        {
            _context.Prescriptions.Add(prescription);

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPrescriptionById),
                new { id = prescription.PrescriptionId },
                prescription);
        }



        // 2. PUT: Update Prescription information
        // Update all prescription details
        [HttpPut("UpdatePrescription")]
        public async Task<IActionResult> UpdatePrescription(int id, Prescription prescription)
        {
            if (id != prescription.PrescriptionId)
            {
                return BadRequest();
            }


            _context.Entry(prescription).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return NoContent();
        }




        // 3. PUT: Second update case
        // Update prescription status only
        [HttpPut("UpdatePrescriptionStatus  ")]
        public async Task<IActionResult> UpdatePrescriptionStatus(int id, string status)
        {
            var prescription = await _context.Prescriptions
                .FindAsync(id);


            if (prescription == null)
            {
                return NotFound();
            }


            prescription.PrescriptionStatus = status;


            await _context.SaveChangesAsync();


            return NoContent();
        }




        // 4. DELETE: Delete Prescription
        [HttpDelete("DeletePrescription")]
        public async Task<IActionResult> DeletePrescription(int id)
        {
            var prescription = await _context.Prescriptions
                .FindAsync(id);


            if (prescription == null)
            {
                return NotFound();
            }


            _context.Prescriptions.Remove(prescription);


            await _context.SaveChangesAsync();


            return NoContent();
        }




        // 5. GET: Get all prescriptions
        // Include related User and Medicines data
        [HttpGet("GetAllPrescriptions")]
        public async Task<ActionResult<IEnumerable<Prescription>>> GetPrescriptions()
        {
            return await _context.Prescriptions
                .Include(x => x.User)
                .Include(x => x.Medicines)
                .ToListAsync();
        }




        // 6. GET: Find prescription by Id
        [HttpGet("GetPrescriptionById")]
        public async Task<ActionResult<Prescription>> GetPrescriptionById(int id)
        {
            var prescription = await _context.Prescriptions
                .Include(x => x.User)
                .Include(x => x.Medicines)
                .FirstOrDefaultAsync(x => x.PrescriptionId == id);



            if (prescription == null)
            {
                return NotFound();
            }


            return prescription;
        }





        // 7. GET: Filter prescriptions using LINQ
        // Filter by prescription status
        [HttpGet("FilterPrescription")]
        public async Task<ActionResult<IEnumerable<Prescription>>> FilterPrescription(string status)
        {
            var prescriptions = await _context.Prescriptions
                .Where(x => x.PrescriptionStatus == status)
                .ToListAsync();


            return prescriptions;
        }





        // 8. GET: Sort prescriptions
        // Sort prescriptions by date
        [HttpGet("sort")]
        public async Task<ActionResult<IEnumerable<Prescription>>> SortPrescriptions()
        {
            var prescriptions = await _context.Prescriptions
                .OrderByDescending(x => x.PrescriptionDate)
                .ToListAsync();


            return prescriptions;
        }

    }
}
