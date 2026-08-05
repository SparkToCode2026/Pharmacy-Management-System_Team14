using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Pharmacy_Management_System.Models
{
    public class MedicineCategory
    {
        // Primary Key
        [Key]
        public int MedicineCategoryId { get; set; }

        // Medicine Category information

        [Required]
        public string MedicineCategoryName { get; set; } = string.Empty;


        [Required]
        public string MedicineCategoryDescription { get; set; } = string.Empty;



        // 1:N Relationship with Medicine

        public List<Medicine> Medicines { get; set; } = new List<Medicine>();

    }
}
