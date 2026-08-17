using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy_Management_System.Models;
using System.Collections.Generic;
using System.Linq;

namespace Pharmacy_Management_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly ProjectContext _context;
        private readonly Pharmacy_Management_System.Services.IEmailService _emailService;

        public PaymentController(ProjectContext context, Pharmacy_Management_System.Services.IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // Process a new payment transaction (Admin / Pharmacist / Customer)
        [HttpPost("CreatePayment")]
        public IActionResult CreatePayment([FromBody] Payment payment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            bool orderAlreadyPaid = _context.Payment.Any(p => p.OrderId == payment.OrderId
                && p.PaymentStatus == PaymentStatus.Completed);
            if (orderAlreadyPaid)
            {
                return BadRequest("This order already has a completed payment.");
            }

            _context.Payment.Add(payment);

            // If payment is Completed, automatically mark the order as Completed
            if (payment.PaymentStatus == PaymentStatus.Completed)
            {
                var order = _context.Orders.FirstOrDefault(o => o.OrderId == payment.OrderId);
                if (order != null && order.Status != "Completed")
                {
                    order.Status = "Completed";
                }
            }

            _context.SaveChanges();

            // Send payment confirmation email to the user
            try
            {
                var order = _context.Orders
                    .Include(o => o.User)
                    .FirstOrDefault(o => o.OrderId == payment.OrderId);

                if (order?.User != null && !string.IsNullOrWhiteSpace(order.User.Email))
                {
                    var receiptBody =
                        $"Hello {order.User.Username},\n\n" +
                        $"We have successfully received your payment!\n\n" +
                        $"Payment Receipt ID: #{payment.PaymentId}\n" +
                        $"Order Number: #{payment.OrderId}\n" +
                        $"Amount Paid: ${payment.Amount:F2}\n" +
                        $"Payment Method: {payment.PaymentMethod}\n" +
                        $"Payment Date: {payment.PaymentDate:g}\n" +
                        $"Payment Status: {payment.PaymentStatus}\n\n" +
                        $"Thank you for your business.\nPharmacy Management Team";

                    _emailService.SendEmailAsync(
                        order.User.Email,
                        $"Payment Confirmation - Receipt #{payment.PaymentId} for Order #{payment.OrderId}",
                        receiptBody);
                }
            }
            catch
            {
                // Prevent email failures from failing payment recording
            }

            return Ok(payment);
        }

        // Update a payment record (Admin only)
        [Authorize(Roles = "1")]
        [HttpPut("UpdatePayment/{id}")]
        public IActionResult UpdatePayment(int id, [FromBody] Payment payment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var pay = _context.Payment.Find(id);
            if (pay == null)
            {
                return NotFound($"Payment with ID {id} was not found.");
            }

            pay.Amount = payment.Amount;
            pay.PaymentDate = payment.PaymentDate;
            pay.PaymentMethod = payment.PaymentMethod;

            _context.SaveChanges();
            return Ok(pay);
        }

        // Update the payment status (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpPatch("UpdatePaymentStatus/{id}")]
        public IActionResult UpdatePaymentStatus(int id, [FromBody] PaymentStatus newStatus)
        {
            var pay = _context.Payment.Find(id);
            if (pay == null)
            {
                return NotFound($"Payment with ID {id} was not found.");
            }

            pay.PaymentStatus = newStatus;
            _context.SaveChanges();

            return Ok(pay);
        }

        // Delete a payment record (Admin only)
        [Authorize(Roles = "1")]
        [HttpDelete("DeletePayment/{id}")]
        public IActionResult DeletePayment(int id)
        {
            var pay = _context.Payment.Find(id);
            if (pay == null)
            {
                return NotFound($"Payment with ID {id} was not found.");
            }

            _context.Payment.Remove(pay);
            _context.SaveChanges();

            return Ok("Payment deleted successfully.");
        }

        // Get all payments with their order (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpGet("GetAllPayments")]
        public IActionResult GetAllPayments()
        {
            List<Payment> payments = _context.Payment
                .Include(p => p.Order)
                .ToList();

            return Ok(payments);
        }

        // Get a payment by ID with its order
        [HttpGet("GetPayment/{id}")]
        public IActionResult GetPayment(int id)
        {
            var pay = _context.Payment
                .Include(p => p.Order)
                .FirstOrDefault(p => p.PaymentId == id);

            if (pay == null)
            {
                return NotFound($"Payment with ID {id} was not found.");
            }

            return Ok(pay);
        }

        // Get payment by Order ID (all authenticated users — used to check if order is paid)
        [HttpGet("GetPaymentByOrderId")]
        public IActionResult GetPaymentByOrderId(int orderId)
        {
            var pay = _context.Payment
                .FirstOrDefault(p => p.OrderId == orderId);

            if (pay == null)
            {
                return NotFound($"No payment found for order {orderId}.");
            }

            return Ok(pay);
        }

        // Filter payments by status (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpGet("FilterByStatus")]
        public IActionResult FilterByStatus([FromQuery] PaymentStatus? status)
        {
            var query = _context.Payment.AsQueryable();

            if (status != null)
            {
                query = query.Where(p => p.PaymentStatus == status);
            }

            List<Payment> payments = query.ToList();
            return Ok(payments);
        }

        // Get revenue analytics and payment order list (Admin only)
        [Authorize(Roles = "1")]
        [HttpGet("GetRevenue")]
        public IActionResult GetRevenue()
        {
            List<Payment> sorted = _context.Payment
                .OrderByDescending(p => p.PaymentDate)
                .ToList();

            decimal totalRevenue = _context.Payment
                .Where(p => p.PaymentStatus == PaymentStatus.Completed)
                .Sum(p => p.Amount);

            return Ok(new
            {
                TotalRevenue = totalRevenue,
                Payments = sorted
            });
        }
    }
}