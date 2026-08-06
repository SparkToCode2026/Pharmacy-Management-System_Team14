using System.ComponentModel.DataAnnotations;

namespace Pharmacy_Management_System.Models
{
    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public DateTime PaymentDate { get; set; }

        [Required]
        public PaymentMethod PaymentMethod { get; set; }

        [Required]
        public PaymentStatus PaymentStatus { get; set; }

        // 1:1 Relationship with Order
        [Required]
        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;
    }

    public enum PaymentMethod
    {
        // Paid in cash at the counter
        Cash,
        // Paid using a credit card
        CreditCard,
        // Paid using a debit card
        DebitCard,
        // Covered by the customer's insurance provider
        Insurance
    }

    public enum PaymentStatus
    {
        // Payment initiated but not yet completed
        Pending,
        // Payment successfully processed
        Completed,
        // Payment attempt failed
        Failed,
        // Payment was refunded to the customer
        Refunded
    }
}
