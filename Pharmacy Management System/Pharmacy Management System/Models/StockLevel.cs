using System.ComponentModel.DataAnnotations;

namespace Pharmacy_Management_System.Models
{
    public class StockLevel
    {
        [Key]
        public int StockLevelId { get; set; }

        [Required]
        public int CurrentQuantity { get; set; }

        [Required]
        public int ReorderLevel { get; set; }

        [Required]
        public DateTime LastRestockedDate { get; set; }

        // N:1 Relationship with Medicine
        [Required]
        public int MedicineId { get; set; }
        public Medicine Medicine { get; set; } = null!;

        // N:1 Relationship with Branch
        [Required]
        public int BranchId { get; set; }
        public Branch Branch { get; set; } = null!;
    }
}
