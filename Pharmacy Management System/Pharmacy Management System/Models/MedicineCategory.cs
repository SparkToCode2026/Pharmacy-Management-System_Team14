namespace Pharmacy_Management_System.Models
{
    public class MedicineCategory
    {
        [Key]
        public int MedicineCategoryId { get; set; }
        [Required]
        public string MedicineCategoryName { get; set; }
        [Required]
        public string MedicineCategoryDescription { get; set; } = string.Empty;

        // 1: N Relationship with Medicine
        public List<Medicine> Medicines { get; set; } = new List<Medicine>();
    }
}
