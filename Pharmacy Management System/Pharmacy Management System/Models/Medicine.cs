using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
namespace Pharmacy_Management_System.Models
{
    public class Medicine
    {
        // Primary Key
        [Key]
        [JsonIgnore]
        public int MedicineId { get; set; }


        // Medicine information
        [Required]
        public string MedicineName { get; set; }
        [Required]
        public string MedicineDescription { get; set; } = string.Empty;
        [Required]
        public double MedicinePrice { get; set; }


        // 1:N Relationship with Manufacturer
        [ForeignKey("Manufacturer")]
        public int ManufacturerId { get; set; }
        [JsonIgnore]
        public Manufacturer Manufacturer { get; set; }

        // Medicine Production and Expiry Dates
        public DateTime MedicineProductionDate { get; set; }
        public DateTime MedicineExpiryDate { get; set; }


        // 1:N Relationship with OrderItem
        [JsonIgnore]
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();


        // N:N Relationship with Prescription
        [JsonIgnore]
        public List<Prescription> Prescriptions { get; set; } = new List<Prescription>();


        // 1:N Relationship with MedicineCategory
        [ForeignKey("MedicineCategory")]
        public int MedicineCategoryId { get; set; }
        [JsonIgnore]
        public MedicineCategory MedicineCategory { get; set; }

        //1: N Relationship with Supplier
        [ForeignKey("Supplier")]
        public int SupplierId { get; set; }
        [JsonIgnore]
        public Supplier Supplier { get; set; }

        // 1: N Relationship with stocklevel
        [JsonIgnore]
        public List<StockLevel> StockLevels { get; set; } = new List<StockLevel>();


    }
}
