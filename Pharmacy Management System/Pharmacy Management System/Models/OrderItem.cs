
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Pharmacy_Management_System.Models
{
    public class OrderItem
    {
        [Key]
        public int OrderItemId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Subtotal { get; set; }


        // N:1 Relationship with Order
        [ForeignKey("Order")]
        public int OrderId { get; set; }

        [JsonIgnore]
        public Order? Order { get; set; }


        // N:1 Relationship with Medicine
        [ForeignKey("Medicine")]
        public int MedicineId { get; set; }

        public Medicine? Medicine { get; set; }


        // Subtotal is a derived attribute: quantity x unit price.
        public void RecalculateSubtotal()
        {
            Subtotal = Quantity * UnitPrice;
        }
    }
}
