using Microsoft.AspNetCore.Mvc;
using Pharmacy_Management_System.Models;

namespace Pharmacy_Management_System.Controllers
{
    [ApiController]
    [Route("MedicineCategory")]
    public class MedicineCategoryController : ControllerBase
    {
        private ProjectContext context;

        public MedicineCategoryController(ProjectContext _context)
        {
            context = _context;
        }
        [HttpPost("AddMedicineCategory")]
        public IActionResult AddMedicineCategory(MedicineCategory medicineCategory)
        {

            context.MedicineCategories.Add(medicineCategory);
            context.SaveChanges();
            return Ok(medicineCategory.MedicineCategoryId);
        }
        [HttpDelete("RemoveMedicineCategory")]
        public IActionResult RemoveMedicineCategory(int medicineCategoryId)
        {
            var medicineCategory = context.MedicineCategories.FirstOrDefault(mc => mc.MedicineCategoryId == medicineCategoryId);
            if (medicineCategory != null)
            {
                context.MedicineCategories.Remove(medicineCategory);
                context.SaveChanges();
                return Ok("Medicine category removed successfully.");
            }
            return NotFound("Medicine category not found.");
        }
        //updates
        [HttpPut("UpdateMedicineCategory")]
        public IActionResult UpdateMedicineCategory(MedicineCategory medicineCategory)
        {
            var existingMedicineCategory = context.MedicineCategories.FirstOrDefault(mc => mc.MedicineCategoryId == medicineCategory.MedicineCategoryId);
            if (existingMedicineCategory != null)
            {
                existingMedicineCategory.MedicineCategoryName = medicineCategory.MedicineCategoryName;
                existingMedicineCategory.MedicineCategoryDescription = medicineCategory.MedicineCategoryDescription;
                context.SaveChanges();
                return Ok("Medicine category updated successfully.");
            }
            return NotFound("Medicine category not found.");
        }
        [HttpPatch("UpdateMedicineCategoryDescription")]
        public IActionResult UpdateMedicineCategoryDescription(int medicineCategoryId, string newDescription)
        {
            var existingMedicineCategory = context.MedicineCategories.FirstOrDefault(mc => mc.MedicineCategoryId == medicineCategoryId);
            if (existingMedicineCategory != null)
            {
                existingMedicineCategory.MedicineCategoryDescription = newDescription;
                context.SaveChanges();
                return Ok("Medicine category description updated successfully.");
            }
            return NotFound("Medicine category not found.");
        }
        [HttpPatch("UpdateMedicineCategoryName")]
        public IActionResult UpdateMedicineCategoryName(int medicineCategoryId, string newName)
        {
            var existingMedicineCategory = context.MedicineCategories.FirstOrDefault(mc => mc.MedicineCategoryId == medicineCategoryId);
            if (existingMedicineCategory != null)
            {
                existingMedicineCategory.MedicineCategoryName = newName;
                context.SaveChanges();
                return Ok("Medicine category name updated successfully.");
            }
            return NotFound("Medicine category not found.");
        }
        //getters

        [HttpGet("GetMedicineCategoryById")]
        public IActionResult GetMedicineCategoryById(int medicineCategoryId)
        {
            var medicineCategory = context.MedicineCategories.FirstOrDefault(mc => mc.MedicineCategoryId == medicineCategoryId);
            if (medicineCategory == null)
            {
                return NotFound("Medicine category not found.");
            }
            return Ok(medicineCategory);
        }
        [HttpGet("GetAllMedicineCategories")]
        public IActionResult GetAllMedicineCategories()
        {
            return Ok(context.MedicineCategories.ToList());
        }
        
        [HttpGet("GetMedicineCategoriesByName")]
        public IActionResult GetMedicineCategoriesByName(string name)
        {
            var medicineCategories = context.MedicineCategories.Where(mc => mc.MedicineCategoryName.Contains(name)).ToList();
            return Ok(medicineCategories);
        }

        [HttpGet("GetMedicineCategoriesByDescription")]
        public IActionResult GetMedicineCategoriesByDescription(string description)
        {
            var medicineCategories = context.MedicineCategories.Where(mc => mc.MedicineCategoryDescription.Contains(description)).ToList();
            return Ok(medicineCategories);
        }
    }
}
