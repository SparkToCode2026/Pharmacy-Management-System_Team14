using Pharmacy_Management_System.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharmacyManagementSystem.Models
{
    /// <summary>
    /// A customer order placed at a branch. Owned by Developer 4 (Amal).
    /// </summary>
    public class Order
    {
        [Key]
        public int OrderId { get; set; }

        /// <summary>Human-readable reference, e.g. ORD-2026-000148. Unique.</summary>
        [Required]
        [MaxLength(30)]
        public string OrderNumber { get; set; } = string.Empty;

        // ---- Foreign keys ----

        [Required]
        public int CustomerProfileId { get; set; }

        [Required]
        public int BranchId { get; set; }

        /// <summary>Optional: an order may or may not be dispensed from a prescription.</summary>
        public int? PrescriptionId { get; set; }

        // ---- Scalar fields ----

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        /// <summary>Pending | Confirmed | Preparing | Ready | Completed | Cancelled</summary>
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = OrderStatus.Pending;

        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [MaxLength(250)]
        public string? DeliveryAddress { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        /// <summary>Guard flag so the confirmation email is only ever sent once.</summary>
        public bool ConfirmationEmailSent { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // ---- Navigation properties ----
        // CustomerProfile & Branch are owned by Developer 6, Prescription by Developer 3,
        // Payment by Developer 5. These navigations only work once their classes exist
        // in the Models folder on Development.

        [ForeignKey(nameof(CustomerProfileId))]
        public CustomerProfile? CustomerProfile { get; set; }

        [ForeignKey(nameof(BranchId))]
        public Branch? Branch { get; set; }

        [ForeignKey(nameof(PrescriptionId))]
        public Prescription? Prescription { get; set; }

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

        /// <summary>One payment per order (Payment.OrderId is unique).</summary>
        public Payment? Payment { get; set; }

        // ---- Helpers ----

        /// <summary>
        /// Recalculates SubTotal and TotalAmount from the non-deleted line items.
        /// Call this after any change to OrderItems.
        /// </summary>
        public void RecalculateTotals()
        {
            SubTotal = OrderItems
                .Where(i => !i.IsDeleted)
                .Sum(i => i.LineTotal);

            TotalAmount = SubTotal - DiscountAmount;

            if (TotalAmount < 0)
            {
                TotalAmount = 0;
            }
        }
    }

    /// <summary>Allowed values for Order.Status.</summary>
    public static class OrderStatus
    {
        public const string Pending = "Pending";
        public const string Confirmed = "Confirmed";
        public const string Preparing = "Preparing";
        public const string Ready = "Ready";
        public const string Completed = "Completed";
        public const string Cancelled = "Cancelled";

        public static readonly string[] All =
        {
            Pending, Confirmed, Preparing, Ready, Completed, Cancelled
        };

        public static bool IsValid(string? status) =>
            status is not null &&
            All.Contains(status, StringComparer.OrdinalIgnoreCase);
    }
}
