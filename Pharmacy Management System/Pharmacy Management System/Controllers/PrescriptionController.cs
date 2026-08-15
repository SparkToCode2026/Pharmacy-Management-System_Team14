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
        // Create prescription record with validation
        [HttpPost("CreatePrescription")]
        public IActionResult CreatePrescription([FromBody] Prescription prescription)
        {
            // Check if the submitted data follows the validation rules
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Add the new prescription to the database
            _context.Prescriptions.Add(prescription);

            // Save changes permanently
            _context.SaveChanges();

            // Return the created prescription details
            return CreatedAtAction(
                nameof(GetPrescriptionById),
                new { id = prescription.PrescriptionId },
                prescription
            );
        }

        // =====================================================
        // 2. PUT: Update Prescription information
        // Update all prescription details
        [Authorize(Roles = "1,2")]
        [HttpPut("UpdatePrescription/{id}")]
        public IActionResult UpdatePrescription(int id, [FromBody] Prescription prescription)
        {
            // Check if the route id matches the prescription id
            if (id != prescription.PrescriptionId)
            {
                return BadRequest("ID mismatch.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Find the existing prescription in the database
            var existingPrescription = _context.Prescriptions.Find(id);

            // Return NotFound if the prescription does not exist
            if (existingPrescription == null)
            {
                return NotFound($"Prescription with ID {id} was not found.");
            }

            // Update prescription information
            existingPrescription.PrescriptionDoctorName = prescription.PrescriptionDoctorName;
            existingPrescription.PrescriptionDate = prescription.PrescriptionDate;
            existingPrescription.PrescriptionDosage = prescription.PrescriptionDosage;
            existingPrescription.PrescriptionDuration = prescription.PrescriptionDuration;
            existingPrescription.PrescriptionStatus = prescription.PrescriptionStatus;
            existingPrescription.UserId = prescription.UserId;

            // Save the updated data
            _context.SaveChanges();

            return Ok(existingPrescription);
        }

        // =====================================================
        // 3. PATCH: Update prescription status only
        [Authorize(Roles = "1,2")]
        [HttpPatch("UpdatePrescriptionStatus/{id}")]
        public IActionResult UpdatePrescriptionStatus(int id, [FromBody] string status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                return BadRequest("Status cannot be empty.");
            }

            // Search for the prescription by id
            var prescription = _context.Prescriptions.Find(id);

            // Check if the prescription exists
            if (prescription == null)
            {
                return NotFound($"Prescription with ID {id} was not found.");
            }

            // Update prescription status
            prescription.PrescriptionStatus = status;

            // Save changes
            _context.SaveChanges();

            return Ok(prescription);
        }

        // =====================================================
        // 4. DELETE: Delete Prescription
        [Authorize(Roles = "1,2")]
        [HttpDelete("DeletePrescription/{id}")]
        public IActionResult DeletePrescription(int id)
        {
            // Find the prescription that should be deleted
            var prescription = _context.Prescriptions.Find(id);

            // Return NotFound if it does not exist
            if (prescription == null)
            {
                return NotFound($"Prescription with ID {id} was not found.");
            }

            // Remove prescription from database
            _context.Prescriptions.Remove(prescription);

            // Save delete operation
            _context.SaveChanges();

            return Ok("Prescription deleted successfully.");
        }

        // =====================================================
        // 5. GET: Get all prescriptions
        [Authorize(Roles = "1,2")]
        [HttpGet("GetAllPrescriptions")]
        public IActionResult GetPrescriptions()
        {
            List<Prescription> prescriptions = _context.Prescriptions
                .Include(x => x.User)
                .Include(x => x.Medicines)
                .ToList();

            return Ok(prescriptions);
        }

        // =====================================================
        // 6. GET: Find prescription by Id
        [HttpGet("GetPrescriptionById/{id}")]
        public IActionResult GetPrescriptionById(int id)
        {
            var prescription = _context.Prescriptions
                .Include(x => x.User)
                .Include(x => x.Medicines)
                .FirstOrDefault(x => x.PrescriptionId == id);

            if (prescription == null)
            {
                return NotFound($"Prescription with ID {id} was not found.");
            }

            return Ok(prescription);
        }

        // =====================================================
        // 7. GET: Filter prescriptions by status
        [Authorize(Roles = "1,2")]
        [HttpGet("FilterPrescription")]
        public IActionResult FilterPrescription([FromQuery] string status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                return BadRequest("Status parameter cannot be empty.");
            }

            var prescriptions = _context.Prescriptions
                .Include(x => x.User)
                .Include(x => x.Medicines)
                .Where(x => x.PrescriptionStatus.ToLower() == status.ToLower())
                .ToList();

            return Ok(prescriptions);
        }

        // =====================================================
        // 8. GET: Sort Prescriptions by date
        [Authorize(Roles = "1,2")]
        [HttpGet("sort")]
        public IActionResult SortPrescriptions()
        {
            var prescriptions = _context.Prescriptions
                .Include(x => x.User)
                .Include(x => x.Medicines)
                .OrderByDescending(x => x.PrescriptionDate)
                .ToList();

            return Ok(prescriptions);
        }
    }
}