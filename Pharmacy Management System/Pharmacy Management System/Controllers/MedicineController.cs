using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy_Management_System.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Pharmacy_Management_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MedicineController : ControllerBase
    {
        private readonly ProjectContext _context;

        public MedicineController(ProjectContext context)
        {
            _context = context;
        }

        // Add a new medicine (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPost("AddMedicine")]
        public IActionResult AddMedicine([FromBody] Medicine medicine)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Medicines.Add(medicine);
            _context.SaveChanges();
            return Ok(medicine.MedicineId);
        }

        // Remove a medicine (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpDelete("RemoveMedicine/{id}")]
        public IActionResult RemoveMedicine(int id)
        {
            var medicine = _context.Medicines.FirstOrDefault(m => m.MedicineId == id);
            if (medicine == null)
            {
                return NotFound("Medicine not found.");
            }

            _context.Medicines.Remove(medicine);
            _context.SaveChanges();
            return Ok("Medicine removed successfully.");
        }

        // Update medicine details (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPut("UpdateMedicine/{id}")]
        public IActionResult UpdateMedicine(int id, [FromBody] Medicine medicine)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingMedicine = _context.Medicines.FirstOrDefault(m => m.MedicineId == id);
            if (existingMedicine == null)
            {
                return NotFound("Medicine not found.");
            }

            existingMedicine.MedicineName = medicine.MedicineName;
            existingMedicine.MedicineCategoryId = medicine.MedicineCategoryId;
            existingMedicine.ManufacturerId = medicine.ManufacturerId;
            existingMedicine.MedicinePrice = medicine.MedicinePrice;
            existingMedicine.MedicineDescription = medicine.MedicineDescription;
            existingMedicine.MedicineProductionDate = medicine.MedicineProductionDate;
            existingMedicine.MedicineExpiryDate = medicine.MedicineExpiryDate;
            existingMedicine.SupplierId = medicine.SupplierId;

            _context.SaveChanges();
            return Ok("Medicine updated successfully.");
        }

        // Update price (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPatch("UpdateMedicinePrice/{id}")]
        public IActionResult UpdateMedicinePrice(int id, [FromBody] double newPrice)
        {
            if (newPrice < 0)
            {
                return BadRequest("Price cannot be negative.");
            }

            var existingMedicine = _context.Medicines.FirstOrDefault(m => m.MedicineId == id);
            if (existingMedicine == null)
            {
                return NotFound("Medicine not found.");
            }

            existingMedicine.MedicinePrice = newPrice;
            _context.SaveChanges();
            return Ok("Medicine price updated successfully.");
        }

        // Update description (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPatch("UpdateMedicineDescription/{id}")]
        public IActionResult UpdateMedicineDescription(int id, [FromBody] string newDescription)
        {
            var existingMedicine = _context.Medicines.FirstOrDefault(m => m.MedicineId == id);
            if (existingMedicine == null)
            {
                return NotFound("Medicine not found.");
            }

            existingMedicine.MedicineDescription = newDescription;
            _context.SaveChanges();
            return Ok("Medicine description updated successfully.");
        }

        // Update expiry date (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPatch("UpdateMedicineExpiryDate/{id}")]
        public IActionResult UpdateMedicineExpiryDate(int id, [FromBody] DateTime newExpiryDate)
        {
            var existingMedicine = _context.Medicines.FirstOrDefault(m => m.MedicineId == id);
            if (existingMedicine == null)
            {
                return NotFound("Medicine not found.");
            }

            existingMedicine.MedicineExpiryDate = newExpiryDate;
            _context.SaveChanges();
            return Ok("Medicine expiry date updated successfully.");
        }

        // Update production date (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPatch("UpdateMedicineProductionDate/{id}")]
        public IActionResult UpdateMedicineProductionDate(int id, [FromBody] DateTime newProductionDate)
        {
            var existingMedicine = _context.Medicines.FirstOrDefault(m => m.MedicineId == id);
            if (existingMedicine == null)
            {
                return NotFound("Medicine not found.");
            }

            existingMedicine.MedicineProductionDate = newProductionDate;
            _context.SaveChanges();
            return Ok("Medicine production date updated successfully.");
        }

        // Update category ID (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPatch("UpdateMedicineCategory/{id}")]
        public IActionResult UpdateMedicineCategory(int id, [FromBody] int newCategoryId)
        {
            var existingMedicine = _context.Medicines.FirstOrDefault(m => m.MedicineId == id);
            if (existingMedicine == null)
            {
                return NotFound("Medicine not found.");
            }

            existingMedicine.MedicineCategoryId = newCategoryId;
            _context.SaveChanges();
            return Ok("Medicine category updated successfully.");
        }

        // Get single medicine by ID (Public access)
        [AllowAnonymous]
        [HttpGet("GetMedicineById/{id}")]
        public IActionResult GetMedicineById(int id)
        {
            var medicine = _context.Medicines
                .Include(m => m.MedicineCategory)
                .Include(m => m.Manufacturer)
                .FirstOrDefault(m => m.MedicineId == id);

            if (medicine == null)
            {
                return NotFound("Medicine not found.");
            }

            return Ok(medicine);
        }

        // Get all medicines (Public access)
        [AllowAnonymous]
        [HttpGet("GetAllMedicines")]
        public IActionResult GetAllMedicines()
        {
            List<Medicine> medicines = _context.Medicines
                .Include(m => m.MedicineCategory)
                .Include(m => m.Manufacturer)
                .ToList();

            return Ok(medicines);
        }

        // Search medicines by name (Public access)
        [AllowAnonymous]
        [HttpGet("GetMedicinesByName")]
        public IActionResult GetMedicinesByName([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Name parameter cannot be empty.");
            }

            List<Medicine> medicines = _context.Medicines
                .Where(m => m.MedicineName.ToLower().Contains(name.ToLower()))
                .ToList();

            return Ok(medicines);
        }

        // Filter medicines by category ID (Public access)
        [AllowAnonymous]
        [HttpGet("GetMedicinesByCategory/{categoryId}")]
        public IActionResult GetMedicinesByCategory(int categoryId)
        {
            List<Medicine> medicines = _context.Medicines
                .Where(m => m.MedicineCategoryId == categoryId)
                .ToList();

            return Ok(medicines);
        }
    }
}