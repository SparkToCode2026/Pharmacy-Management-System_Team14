using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pharmacy_Management_System.Models;
using System.Collections.Generic;
using System.Linq;

namespace Pharmacy_Management_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MedicineCategoryController : ControllerBase
    {
        private readonly ProjectContext _context;

        public MedicineCategoryController(ProjectContext context)
        {
            _context = context;
        }

        // Add a new medicine category (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPost("AddMedicineCategory")]
        public IActionResult AddMedicineCategory([FromBody] MedicineCategory medicineCategory)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.MedicineCategories.Add(medicineCategory);
            _context.SaveChanges();
            return Ok(medicineCategory.MedicineCategoryId);
        }

        // Delete a medicine category (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpDelete("RemoveMedicineCategory/{id}")]
        public IActionResult RemoveMedicineCategory(int id)
        {
            var medicineCategory = _context.MedicineCategories
                .FirstOrDefault(mc => mc.MedicineCategoryId == id);

            if (medicineCategory == null)
            {
                return NotFound("Medicine category not found.");
            }

            _context.MedicineCategories.Remove(medicineCategory);
            _context.SaveChanges();
            return Ok("Medicine category removed successfully.");
        }

        // Update entire medicine category (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPut("UpdateMedicineCategory/{id}")]
        public IActionResult UpdateMedicineCategory(int id, [FromBody] MedicineCategory medicineCategory)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingMedicineCategory = _context.MedicineCategories
                .FirstOrDefault(mc => mc.MedicineCategoryId == id);

            if (existingMedicineCategory == null)
            {
                return NotFound("Medicine category not found.");
            }

            existingMedicineCategory.MedicineCategoryName = medicineCategory.MedicineCategoryName;
            existingMedicineCategory.MedicineCategoryDescription = medicineCategory.MedicineCategoryDescription;

            _context.SaveChanges();
            return Ok("Medicine category updated successfully.");
        }

        // Update description only (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPatch("UpdateMedicineCategoryDescription/{id}")]
        public IActionResult UpdateMedicineCategoryDescription(int id, [FromBody] string newDescription)
        {
            var existingMedicineCategory = _context.MedicineCategories
                .FirstOrDefault(mc => mc.MedicineCategoryId == id);

            if (existingMedicineCategory == null)
            {
                return NotFound("Medicine category not found.");
            }

            existingMedicineCategory.MedicineCategoryDescription = newDescription;
            _context.SaveChanges();
            return Ok("Medicine category description updated successfully.");
        }

        // Update name only (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPatch("UpdateMedicineCategoryName/{id}")]
        public IActionResult UpdateMedicineCategoryName(int id, [FromBody] string newName)
        {
            if (string.IsNullOrWhiteSpace(newName))
            {
                return BadRequest("Category name cannot be empty.");
            }

            var existingMedicineCategory = _context.MedicineCategories
                .FirstOrDefault(mc => mc.MedicineCategoryId == id);

            if (existingMedicineCategory == null)
            {
                return NotFound("Medicine category not found.");
            }

            existingMedicineCategory.MedicineCategoryName = newName;
            _context.SaveChanges();
            return Ok("Medicine category name updated successfully.");
        }

        // Get single category by ID (Public access)
        [AllowAnonymous]
        [HttpGet("GetMedicineCategoryById/{id}")]
        public IActionResult GetMedicineCategoryById(int id)
        {
            var medicineCategory = _context.MedicineCategories
                .Select(c => new
                {
                    c.MedicineCategoryId,
                    c.MedicineCategoryName,
                    c.MedicineCategoryDescription
                })
                .FirstOrDefault(mc => mc.MedicineCategoryId == id);

            if (medicineCategory == null)
            {
                return NotFound("Medicine category not found.");
            }

            return Ok(medicineCategory);
        }

        // Get all categories (Public access)
        [AllowAnonymous]
        [HttpGet("GetAllMedicineCategories")]
        public IActionResult GetAllMedicineCategories()
        {
            var categories = _context.MedicineCategories
                .Select(c => new
                {
                    c.MedicineCategoryId,
                    c.MedicineCategoryName,
                    c.MedicineCategoryDescription
                })
                .ToList();

            return Ok(categories);
        }

        // Search categories by name (Public access)
        [AllowAnonymous]
        [HttpGet("GetMedicineCategoriesByName")]
        public IActionResult GetMedicineCategoriesByName([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Name parameter cannot be empty.");
            }

            var medicineCategories = _context.MedicineCategories
                .Where(mc => mc.MedicineCategoryName.ToLower().Contains(name.ToLower()))
                .Select(c => new
                {
                    c.MedicineCategoryId,
                    c.MedicineCategoryName,
                    c.MedicineCategoryDescription
                })
                .ToList();

            return Ok(medicineCategories);
        }

        // Search categories by description (Public access)
        [AllowAnonymous]
        [HttpGet("GetMedicineCategoriesByDescription")]
        public IActionResult GetMedicineCategoriesByDescription([FromQuery] string description)
        {
            if (string.IsNullOrWhiteSpace(description))
            {
                return BadRequest("Description parameter cannot be empty.");
            }

            var medicineCategories = _context.MedicineCategories
                .Where(mc => mc.MedicineCategoryDescription.ToLower().Contains(description.ToLower()))
                .Select(c => new
                {
                    c.MedicineCategoryId,
                    c.MedicineCategoryName,
                    c.MedicineCategoryDescription
                })
                .ToList();

            return Ok(medicineCategories);
        }
    }
}