using Microsoft.AspNetCore.Mvc;
using Pharmacy_Management_System.Models;

namespace Pharmacy_Management_System.Controllers
{
    [ApiController]
    [Route("Medicine")]
    public class MedicineController : ControllerBase
    {
        private ProjectContext context;

        public MedicineController(ProjectContext _context)
        {
            context = _context;
        }


        [HttpPost("AddMedicine")]
        public IActionResult AddMedicine(Medicine medicine)
        {
            
            context.Medicines.Add(medicine);
            context.SaveChanges();
            return Ok(medicine.MedicineId);
        }
        [HttpDelete("RemoveMedicine")]
        public IActionResult RemoveMedicine(int medicineId)
        {
            var medicine = context.Medicines.FirstOrDefault(m => m.MedicineId == medicineId);
            if (medicine != null)
            {
                context.Medicines.Remove(medicine);
                context.SaveChanges();
                return Ok("Medicine removed successfully.");
            }
            return NotFound("Medicine not found.");
        }
        [HttpPut("UpdateMedicine")]
        public IActionResult UpdateMedicine(Medicine medicine)
        {
            var existingMedicine = context.Medicines.FirstOrDefault(m => m.MedicineId == medicine.MedicineId);
            if (existingMedicine != null)
            {
                existingMedicine.MedicineName = medicine.MedicineName;
                existingMedicine.MedicineCategoryId = medicine.MedicineCategoryId;
                existingMedicine.ManufacturerId = medicine.ManufacturerId;
                existingMedicine.MedicinePrice = medicine.MedicinePrice;
                existingMedicine.MedicineDescription = medicine.MedicineDescription;
                existingMedicine.MedicineProductionDate = medicine.MedicineProductionDate;
                existingMedicine.MedicineExpiryDate = medicine.MedicineExpiryDate;
                context.SaveChanges();
                return Ok("Medicine updated successfully.");
            }
            return NotFound("Medicine not found.");
        }
        [HttpPatch("UpdateMedicinePrice")]
        public IActionResult UpdateMedicinePrice(int medicineId, double newPrice)
        {
            var existingMedicine = context.Medicines.FirstOrDefault(m => m.MedicineId == medicineId);
            if (existingMedicine != null)
            {
                existingMedicine.MedicinePrice = newPrice;
                context.SaveChanges();
                return Ok("Medicine price updated successfully.");
            }
            return NotFound("Medicine not found.");
        }
        [HttpPatch("UpdateMedicineDescription")]
        public IActionResult UpdateMedicineDescription(int medicineId, string newDescription)
        {
            var existingMedicine = context.Medicines.FirstOrDefault(m => m.MedicineId == medicineId);
            if (existingMedicine != null)
            {
                existingMedicine.MedicineDescription = newDescription;
                context.SaveChanges();
                return Ok();
            }
            return NotFound("Medicine not found.");
        }

        [HttpPatch("UpdateMedicineExpiryDate")]
        public IActionResult UpdateMedicineExpiryDate(int medicineId, DateTime newExpiryDate)
        {
            var existingMedicine = context.Medicines.FirstOrDefault(m => m.MedicineId == medicineId);
            if (existingMedicine != null)
            {
                existingMedicine.MedicineExpiryDate = newExpiryDate;
                context.SaveChanges();
                return Ok();
            }
            return NotFound("Medicine not found.");
        }
        [HttpPatch("UpdateMedicineProductionDate")]
        public IActionResult UpdateMedicineProductionDate(int medicineId, DateTime newProductionDate)
        {
            var existingMedicine = context.Medicines.FirstOrDefault(m => m.MedicineId == medicineId);
            if (existingMedicine != null)
            {
                existingMedicine.MedicineProductionDate = newProductionDate;
                context.SaveChanges();
                return Ok();


            }
            return NotFound("Medicine not found.");
        }

        [HttpPatch("UpdateMedicineCategory")]
        public IActionResult UpdateMedicineCategory(int medicineId, int newCategoryId)
        {
            var existingMedicine = context.Medicines.FirstOrDefault(m => m.MedicineId == medicineId);
            if (existingMedicine != null)
            {
                existingMedicine.MedicineCategoryId = newCategoryId;
                context.SaveChanges();
                return Ok();
            }
            return NotFound("Medicine not found.");
        }

        [HttpGet("GetMedicineById")]
        public IActionResult GetMedicineById(int medicineId)
        {
            var medicine = context.Medicines.FirstOrDefault(m => m.MedicineId == medicineId);
            if (medicine == null)
            {
                return NotFound("Medicine not found.");
            }
            return Ok(medicine);
        }
        [HttpGet("GetAllMedicines")]
        public IActionResult GetAllMedicines()
        {
            return Ok(context.Medicines.ToList());
        }
        [HttpGet("GetMedicinesByName")]
        public IActionResult GetMedicinesByName(string name)
        {
            var medicines = context.Medicines.Where(m => m.MedicineName.Contains(name)).ToList();
            return Ok(medicines);
        }
        [HttpGet("GetMedicinesByCategory")]
        public IActionResult GetMedicinesByCategory(int categoryId)
        {
            var medicines = context.Medicines.Where(m => m.MedicineCategoryId == categoryId).ToList();
            return Ok(medicines);
        }
    }
}
