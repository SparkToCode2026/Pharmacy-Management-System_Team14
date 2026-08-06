using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Pharmacy_Management_System.Models
{
    public class User
    {
        [Key]
        [JsonIgnore]
        public int UserId { get; set; }
        [Required]
        public string Username { get; set; } = string.Empty;
        [Required]
        public string Email { get; set; } = string.Empty;
        [Required]
        [JsonIgnore]
        public string Password { get; set; }= string.Empty;
        public DateTime createdAt { get; set; } = DateTime.Now;


        // Multi-valued attribute 
        [JsonIgnore]
        public List<Role>? Roles { get; set; } = new List<Role>();


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
