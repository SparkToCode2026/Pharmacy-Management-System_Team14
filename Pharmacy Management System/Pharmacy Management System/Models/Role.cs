using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
namespace Pharmacy_Management_System.Models
{
    public class Role
    {
        [Key]
        [JsonIgnore]
        public int RoleId { get; set; }
        [Required]
        public string RoleName { get; set; } = string.Empty;

        // Navigation property back to User
        [JsonIgnore]
        public List<User>? Users { get; set; } = new List<User>();
    }
}
