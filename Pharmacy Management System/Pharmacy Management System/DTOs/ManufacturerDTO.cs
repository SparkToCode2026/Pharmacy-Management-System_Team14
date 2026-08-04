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
    // DTO for sending data back to the client
    public class ManufacturerOutputDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;
        public string ContactEmail { get; set; } = string.Empty;
    }
}
