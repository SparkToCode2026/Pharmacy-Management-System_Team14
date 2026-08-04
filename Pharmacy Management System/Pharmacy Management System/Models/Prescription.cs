namespace Pharmacy_Management_System.Models
{
    public class Prescription
    {
        public int PrescriptionId { get; set; }

        public string DoctorName { get; set; } = string.Empty;

        public DateTime PrescriptionDate { get; set; }

        public string Dosage { get; set; } = string.Empty;

        public string Duration { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;
    }
}
