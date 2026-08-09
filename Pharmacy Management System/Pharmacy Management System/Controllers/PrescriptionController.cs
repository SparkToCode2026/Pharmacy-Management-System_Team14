using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy_Management_System.Models;

namespace Pharmacy_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrescriptionController : ControllerBase
    {
        // Database context used to access Prescription table and related entities
        private readonly ProjectContext _context;


        // Constructor receives the database context using Dependency Injection
        public PrescriptionController(ProjectContext context)
        {
            _context = context;
        }



        // =====================================================
        // 1. POST: Create a new Prescription
        // Creates a new prescription record and saves it into the database.
        // Model validation is checked before saving the data.
        // =====================================================
        [HttpPost]
        public async Task<ActionResult<Prescription>> CreatePrescription(Prescription prescription)
        {
            // Check if the submitted data follows the validation rules
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            // Add the new prescription to the database
            _context.Prescriptions.Add(prescription);


            // Save changes permanently
            await _context.SaveChangesAsync();


            // Return the created prescription details
            return CreatedAtAction(
                nameof(GetPrescriptionById),
                new { id = prescription.PrescriptionId },
                prescription
            );
        }




        // =====================================================
        // 2. PUT: Update Prescription
        // Updates all prescription information.
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePrescription(int id, Prescription prescription)
        {
            // Check if the route id matches the prescription id
            if (id != prescription.PrescriptionId)
            {
                return BadRequest();
            }


            // Find the existing prescription in the database
            var existingPrescription = await _context.Prescriptions
                .FindAsync(id);


            // Return NotFound if the prescription does not exist
            if (existingPrescription == null)
            {
                return NotFound();
            }


            // Update prescription information
            existingPrescription.PrescriptionDoctorName = prescription.PrescriptionDoctorName;
            existingPrescription.PrescriptionDate = prescription.PrescriptionDate;
            existingPrescription.PrescriptionDosage = prescription.PrescriptionDosage;
            existingPrescription.PrescriptionDuration = prescription.PrescriptionDuration;
            existingPrescription.PrescriptionStatus = prescription.PrescriptionStatus;
            existingPrescription.UserId = prescription.UserId;


            // Save the updated data
            await _context.SaveChangesAsync();


            return NoContent();
        }





        // =====================================================
        // 3. PUT: Update Prescription Status
        // Updates only the status of a prescription.
        // This is a second independent update case.
        // =====================================================
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdatePrescriptionStatus(int id, string status)
        {
            // Search for the prescription by id
            var prescription = await _context.Prescriptions
                .FindAsync(id);


            // Check if the prescription exists
            if (prescription == null)
            {
                return NotFound();
            }


            // Update prescription status
            prescription.PrescriptionStatus = status;


            // Save changes
            await _context.SaveChangesAsync();


            return NoContent();
        }





        // =====================================================
        // 4. DELETE: Delete Prescription
        // Removes a prescription record from the database.
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePrescription(int id)
        {
            // Find the prescription that should be deleted
            var prescription = await _context.Prescriptions
                .FindAsync(id);


            // Return NotFound if it does not exist
            if (prescription == null)
            {
                return NotFound();
            }


            // Remove prescription from database
            _context.Prescriptions.Remove(prescription);


            // Save delete operation
            await _context.SaveChangesAsync();


            return NoContent();
        }





        // =====================================================
        // 5. GET: Get All Prescriptions
        // Returns all prescriptions with related User and Medicines data.
        // Include() is used to load navigation properties.
        // =====================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Prescription>>> GetPrescriptions()
        {
            return await _context.Prescriptions

                // Include related User information
                .Include(x => x.User)

                // Include related Medicines information
                .Include(x => x.Medicines)

                .ToListAsync();
        }





        // =====================================================
        // 6. GET: Get Prescription By Id
        // Returns a single prescription using its primary key.
        // =====================================================
        [HttpGet("{id}")]
        public async Task<ActionResult<Prescription>> GetPrescriptionById(int id)
        {
            // Search for prescription and include related data
            var prescription = await _context.Prescriptions

                .Include(x => x.User)
                .Include(x => x.Medicines)

                .FirstOrDefaultAsync(
                    x => x.PrescriptionId == id
                );


            // Check if prescription exists
            if (prescription == null)
            {
                return NotFound();
            }


            return prescription;
        }





        // =====================================================
        // 7. GET: Filter Prescriptions
        // Filters prescriptions based on their status.
        // Uses LINQ Where() method.
        // Example: Pending, Completed.
        // =====================================================
        [HttpGet("filter/{status}")]
        public async Task<ActionResult<IEnumerable<Prescription>>> FilterPrescription(string status)
        {
            var prescriptions = await _context.Prescriptions

                // Load related entities
                .Include(x => x.User)
                .Include(x => x.Medicines)

                // Filter records by prescription status
                .Where(x => x.PrescriptionStatus == status)

                .ToListAsync();


            return prescriptions;
        }





        // =====================================================
        // 8. GET: Sort Prescriptions
        // Sorts prescriptions by date from newest to oldest.
        // Uses LINQ OrderByDescending().
        // =====================================================
        [HttpGet("sort")]
        public async Task<ActionResult<IEnumerable<Prescription>>> SortPrescriptions()
        {
            var prescriptions = await _context.Prescriptions

                // Sort prescriptions by prescription date
                .OrderByDescending(x => x.PrescriptionDate)

                .ToListAsync();


            return prescriptions;
        }

    }
}
