using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Pharmacy_Management_System.Models
{
    public class CustomerProfile
    {
        [Key]
        [JsonIgnore]
        public int CustomerId { get; set; }
        [Required, Phone]
        public int CustomerPhone { get; set; } 
        [Required]
        public string CustomerAddress { get; set; }
        [Required]
        public DateTime DateOfBirth { get; set; }


        [ForeignKey("Users")]
        public int UserId { get; set; } // Foreign key to the User entity
        [JsonIgnore]
        public User? Users { get; set; } // Navigation property to the User entity
    }
}
