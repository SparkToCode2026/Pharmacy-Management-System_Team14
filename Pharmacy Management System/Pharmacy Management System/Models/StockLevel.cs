namespace Pharmacy_Management_System.Models
{
    public class StockLevel
    {
        public int StockLevelId { get; set; }
        public int CurrentQuantity { get; set; }
        public int ReorderLevel { get; set; }
        public DateTime LastRestockedDate { get; set; }

        public int MedicineId { get; set; }
        public Medicine Medicine { get; set; } = null!;

        public int BranchId { get; set; }
        public Branch Branch { get; set; } = null!;
    }
}