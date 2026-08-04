using System.ComponentModel.DataAnnotations;
namespace Pharmacy_Management_System.DTOs
{
    // DTO for receiving data from the client
    public class UserInputDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;

        public List<string> Roles { get; set; } = new();
    }

}
