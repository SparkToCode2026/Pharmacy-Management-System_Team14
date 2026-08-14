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

        public PaymentController(ProjectContext context)
        {
            _context = context;
        }

        // Process a new payment transaction (Admin / Pharmacist / Customer)
        [HttpPost("CreatePayment")]
        public IActionResult CreatePayment([FromBody] Payment payment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            bool orderAlreadyPaid = _context.Payment.Any(p => p.OrderId == payment.OrderId);
            if (orderAlreadyPaid)
            {
                return BadRequest("This order already has a payment.");
            }

            _context.Payment.Add(payment);
            _context.SaveChanges();

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