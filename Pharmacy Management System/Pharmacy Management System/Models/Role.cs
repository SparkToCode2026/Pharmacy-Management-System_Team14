using System.ComponentModel.DataAnnotations;
namespace Pharmacy_Management_System.Models
{
    public class Role
    {
        [Key]
        public int RoleId { get; set; }
        [Required]
        public string RoleName { get; set; } = string.Empty;

        // Navigation property back to User
        public List<User> Users { get; set; } = new List<User>();
    }
}
