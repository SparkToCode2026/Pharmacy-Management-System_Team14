using System.ComponentModel.DataAnnotations;
namespace Pharmacy_Management_System.DTOs
{
    // DTO for receiving data from the client
    public class ManufacturerInputDto
    {
        [Required]
        [StringLength(150, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string LicenseNumber { get; set; } = string.Empty;

        [Phone]
        [StringLength(20)]
        public string ContactPhone { get; set; } = string.Empty;

        [EmailAddress]
        [StringLength(150)]
        public string ContactEmail { get; set; } = string.Empty;
    }
}
