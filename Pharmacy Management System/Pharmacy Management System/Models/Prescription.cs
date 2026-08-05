using System.ComponentModel.DataAnnotations;

namespace Pharmacy_Management_System.Models
{
    public class Prescription
    {
        // Primary Key
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


        // Foreign Key relationship with Supplier
        public int SupplierId { get; set; }

        // 1:N Relationship with Supplier
        public Supplier? Supplier { get; set; }
    }
}
