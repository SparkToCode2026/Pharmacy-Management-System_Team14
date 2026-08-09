using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
namespace Pharmacy_Management_System.Models
{
    public class Manufacturer
    {
        [Key]
        [JsonIgnore]
        public int ManufacturerId { get; set; }
        [Required]
        public string ManufacturerName { get; set; }
        [Required]
        public string LicenseNumber { get; set; }
        [Required]
        public string ContactNumber { get; set; }
        [Required]
        public string ContactEmail { get; set; }

        // 1:N Relationship with Medicine
        [JsonIgnore]
        public List<Medicine>? Medicines { get; set; } = new List<Medicine>();

    }
}




