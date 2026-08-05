using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pharmacy_Management_System.Models
{
    public class Medicine
    {
        // Primary Key
        [Key]
        public int MedicineId { get; set; }


        // Medicine information
        [Required]
        public string MedicineName { get; set; } = string.Empty;

        [Required]
        public string MedicineDescription { get; set; } = string.Empty;

        [Required]
        public double MedicinePrice { get; set; }


        // 1:N Relationship with Manufacturer
        [ForeignKey("Manufacturer")]
        public int ManufacturerId { get; set; }

        public Manufacturer Manufacturer { get; set; }


        // Medicine Production and Expiry Dates
        public DateTime MedicineProductionDate { get; set; }

        public DateTime MedicineExpiryDate { get; set; }


        // 1:N Relationship with OrderItem
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();


        // N:N Relationship with Prescription
        public List<Prescription> Prescriptions { get; set; } = new List<Prescription>();


        // 1:N Relationship with MedicineCategory
        [ForeignKey("MedicineCategory")]
        public int MedicineCategoryId { get; set; }

        public MedicineCategory MedicineCategory { get; set; }


        // 1:N Relationship with Supplier
        [ForeignKey("Supplier")]
        public int SupplierId { get; set; }

        public Supplier Supplier { get; set; }


        // 1:N Relationship with StockLevel
        public List<StockLevel> StockLevels { get; set; } = new List<StockLevel>();

    }
}
