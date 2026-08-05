using Pharmacy_Management_System.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PharmacyManagementSystem.Models
{
    /// <summary>
    /// A single medicine line on an order. Owned by Developer 4 (Amal).
    /// </summary>
    public class OrderItem
    {
        [Key]
        public int OrderItemId { get; set; }

        // ---- Foreign keys ----

        [Required]
        public int OrderId { get; set; }

        [Required]
        public int MedicineId { get; set; }

        // ---- Scalar fields ----

        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
        public int Quantity { get; set; }

        /// <summary>Price snapshot taken when the order was placed, not the live Medicine price.</summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Discount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal LineTotal { get; set; }

        /// <summary>Ties the dispensed units back to a StockLevel batch.</summary>
        [MaxLength(50)]
        public string? BatchNumber { get; set; }

        [Column(TypeName = "date")]
        public DateTime? ExpiryDate { get; set; }

        public bool IsDeleted { get; set; }

        // ---- Navigation properties ----
        // Medicine is owned by Developer 2.

        [JsonIgnore]
        [ForeignKey(nameof(OrderId))]
        public Order? Order { get; set; }

        [ForeignKey(nameof(MedicineId))]
        public Medicine? Medicine { get; set; }

        // ---- Helpers ----

        /// <summary>LineTotal = (Quantity x UnitPrice) - Discount, floored at 0.</summary>
        public void RecalculateLineTotal()
        {
            var total = (Quantity * UnitPrice) - Discount;
            LineTotal = total < 0 ? 0 : total;
        }
    }
}
