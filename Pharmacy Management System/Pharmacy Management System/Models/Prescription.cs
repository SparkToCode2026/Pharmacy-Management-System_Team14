using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

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



        // Foreign Key relationship with User
        [ForeignKey("User")]
        public int UserId { get; set; }


        // 1:N Relationship with User
        // One User can have many Prescriptions
        public User? User { get; set; }



        // N:N Relationship with Medicine
        // One Prescription can contain many Medicines
        // One Medicine can exist in many Prescriptions
        public List<Medicine> Medicines { get; set; } = new List<Medicine>();

    }
}
