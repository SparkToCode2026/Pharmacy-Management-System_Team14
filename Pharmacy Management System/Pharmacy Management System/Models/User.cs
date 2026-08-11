using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Pharmacy_Management_System.Models
{
    public class User
    {
        [Key]
        
        public int UserId { get; set; }
        [Required]
        public string Username { get; set; } = string.Empty;
        [Required]
        public string Email { get; set; } = string.Empty;
        
        
        public string? Password { get; set; }
        public DateTime createdAt { get; set; } = DateTime.Now;


        // Multi-valued attribute 
        public int? RoleId { get; set; }

        [ForeignKey("RoleId")]
        public Role? Role { get; set; }


        // 1:1 Relationship with CustomerProfile
        [JsonIgnore]
        public CustomerProfile? CustomerProfile { get; set; }

        // 1:N Relationship with Order
        [JsonIgnore]
        public List<Order>? Orders { get; set; } = new List<Order>();


        // 1:N Relationship with Prescription
        [JsonIgnore]
        public List<Prescription>? Prescriptions { get; set; } = new List<Prescription>();
    }
}
