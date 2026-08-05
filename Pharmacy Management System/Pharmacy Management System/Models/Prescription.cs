using System.ComponentModel.DataAnnotations;

namespace Pharmacy_Management_System.Models
{
    public class Prescription
    {
        [Key]
        public int PrescriptionId { get; set; }


        // Prescription information

        [Required]
        public string PrescriptionDoctorName { get; set; } = string.Empty;


        [Required]
        public DateTime PrescriptionDate { get; set; }


        [Required]
        public string PrescriptionDosage { get; set; } = string.Empty;


        [Required]
        public string PrescriptionDuration { get; set; } = string.Empty;


        [Required]
        public string PrescriptionStatus { get; set; } = string.Empty;



        // Foreign Key relationship with User

        [Required]
        public int UserId { get; set; }


        // 1:N Relationship with User

        public User? User { get; set; }



        // N:N Relationship with Medicine

        public List<Medicine> Medicines { get; set; } = new List<Medicine>();


        // Foreign Key relationship with Supplier (REMOVE if still exists)
        // Prescription has no relationship with Supplier
    }
}
