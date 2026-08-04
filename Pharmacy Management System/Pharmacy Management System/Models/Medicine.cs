namespace Pharmacy_Management_System.Models
{
    public class Medicine
    {
        [Key]
        public int MedicineId { get; set; }
        [Required]
        public string MedicineName { get; set; }
        [Required]
        public string MedicineDescription { get; set; } = string.Empty;
        [Required]
        public double MedicinePrice { get; set; }

        // 1: N Relationship with Manafacturer
        [ForeignKey("Manufacturer")]
        public int ManufacturerId { get; set; }
        public Manufacturer Manufacturer { get; set; }
        public DateTime MedicineProductionDate { get; set; }
        public DateTime MedicineExpiryDate { get; set; }

        // 1: N Relationship with OrderItem
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

        //N: N Relationship with Prescription
        public List<Prescription> Prescriptions { get; set; } = new List<Prescription();

        // 1: N Relationship with MedicineCategory
        [ForeignKey("MedicineCategory")]
        public int MedicineCategoryId { get; set; }
        public MedicineCategory MedicineCategory { get; set; }

        //1: N Relationship with Supplier
        [ForeignKey("Supplier")]
        public int SupplierId { get; set; }
        public Supplier Supplier { get; set; }

        // 1: N Relationship with stocklevel
        public List<StockLevel> StockLevels { get; set; } = new List<StockLevel>();


    }
}
