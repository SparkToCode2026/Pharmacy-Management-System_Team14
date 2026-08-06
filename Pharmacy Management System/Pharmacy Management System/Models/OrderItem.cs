using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pharmacy_Management_System.Models
{
    public class OrderItem
    {
        [Key]
        public int OrderItemId { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public decimal UnitPrice { get; set; }

        public decimal Subtotal { get; set; }

        public int OrderId { get; set; }

        [JsonIgnore]
        public Order? Order { get; set; }

        public int MedicineId { get; set; }

        public Medicine? Medicine { get; set; }

        public void RecalculateSubtotal()
        {
            Subtotal = UnitPrice * Quantity;
        }
    }
}
