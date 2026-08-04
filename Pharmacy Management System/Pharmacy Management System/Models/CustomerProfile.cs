using System.ComponentModel.DataAnnotations.Schema;

namespace Pharmacy_Management_System.Models
{
    public class CustomerProfile
    {
        public int CustomerId { get; set; }
        public string CustomerPhone { get; set; }
        public string CustomerAddress { get; set; }
        public DateTime DateOfBirth { get; set; }


        [ForeignKey("Users")]
        public int UserId { get; set; } // Foreign key to the User entity
        public User Users { get; set; } // Navigation property to the User entity
    }
}
