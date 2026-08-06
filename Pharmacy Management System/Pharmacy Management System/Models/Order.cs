
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pharmacy_Management_System.Models
{
    public class Order
    {
        [Key]
        public int OrderId { get; set; }

        [Required]
        public DateTime OrderDate { get; set; } = DateTime.Now;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending";


        // N:1 Relationship with User
        [ForeignKey("User")]
        public int UserId { get; set; }

        public User? User { get; set; }


        // 1:N Relationship with OrderItem
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

        // N:1 Relationship with Branch
        public int BranchId { get; set; }
        public Branch? Branch { get; set; }


        // TotalAmount is a derived attribute: the sum of all line subtotals.
        public void RecalculateTotal()
        {
            TotalAmount = OrderItems.Sum(i => i.Subtotal);
        }
    }
}
