using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pharmacy_Management_System.Models
{
    public class OrderItem
    {
        [Key]
        [JsonIgnore]
        public int OrderItemId { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public decimal UnitPrice { get; set; }

        public decimal Subtotal { get; set; }





        // Foreign key for Order
        public int OrderId { get; set; }

        [JsonIgnore]
        public Order? Order { get; set; }


        // Foreign key for Medicine
        public int MedicineId { get; set; }

        [JsonIgnore]    
        public Medicine? Medicine { get; set; }

        public void RecalculateSubtotal()
        {
            Subtotal = UnitPrice * Quantity;
        }
    }
}
