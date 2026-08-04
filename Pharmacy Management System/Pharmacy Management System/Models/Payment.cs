namespace Pharmacy_Management_System.Models
{
    public class Payment
    {
        public int PaymentId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public PaymentStatus PaymentStatus { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;
    }

    public enum PaymentMethod
    {
        Cash,
        CreditCard,
        DebitCard,
        Insurance
    }

    public enum PaymentStatus
    {
        Pending,
        Completed,
        Failed,
        Refunded
    }
}
