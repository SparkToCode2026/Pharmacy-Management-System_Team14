using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy_Management_System.Models;

namespace Pharmacy_Management_System.Controllers
{
    [ApiController]
    [Route("Payment")]
    public class PaymentController : ControllerBase
    {
        private ProjectContext _context;
        public PaymentController(ProjectContext context)
        {
            _context = context;
        }

        //Process  new payment transaction
        [HttpPost("CreatePayment")]
        public IActionResult CreatePayment([FromBody] Payment payment)
        {
            bool orderAlreadyPaid = _context.Payment.Any(p => p.OrderId == payment.OrderId);
            if (orderAlreadyPaid)
            {
                return BadRequest("This order already has a payment.");
            }
            _context.Payment.Add(payment);
            _context.SaveChanges();
            return Ok(payment);
        }

        //Update a payment record
        [HttpPut("{id}")]
        public IActionResult UpdatePayment(int id, [FromBody] Payment payment)
        {
            var pay = _context.Payment.Find(id);
            if (pay == null)
            {
                return NotFound();
            }
            pay.Amount = payment.Amount;
            pay.PaymentDate = payment.PaymentDate;
            pay.PaymentMethod = payment.PaymentMethod;

            _context.SaveChanges();
            return Ok(pay);
        }

        //Update the payment status
        [HttpPatch("{id}/status")]
        public IActionResult UpdatePaymentStatus(int id, [FromBody] PaymentStatus newStatus)
        {
            var pay = _context.Payment.Find(id);
            if (pay == null)
            {
                return NotFound();
            }
            pay.PaymentStatus = newStatus;
            _context.SaveChanges();
            return Ok(pay);
        }

        //Delete a payment record
        [HttpDelete("{id}")]
        public IActionResult DeletePayment(int id)
        {
            var pay = _context.Payment.Find(id);
            if (pay == null)
            {
                return NotFound();
            }
            _context.Payment.Remove(pay);
            _context.SaveChanges();
            return Ok();
        }

        //Get all payments with their order
        [HttpGet]
        public IActionResult GetAllPayments()
        {
            var payments = _context.Payment
                                    .Include(p => p.Order)
                                    .ToList();
            return Ok(payments);
        }

        //Get a payment by id with their order
        [HttpGet("{id}")]
        public IActionResult GetPayment(int id)
        {
            var pay = _context.Payment
                               .Include(p => p.Order)
                               .FirstOrDefault(p => p.PaymentId == id);
            if (pay == null)
            {
                return NotFound();
            }
            return Ok(pay);
        }

        //Filter payments by status
        [HttpGet("filter")]
        public IActionResult FilterByStatus([FromQuery] PaymentStatus? status)
        {
            var query = _context.Payment.AsQueryable();
            if (status != null)
            {
                query = query.Where(p => p.PaymentStatus == status);
            }
            var payments = query.ToList();
            return Ok(payments);
        }

        //Sort payments by date and calculate total revenue
        [HttpGet("revenue")]
        public IActionResult GetRevenue()
        {
            var sorted = _context.Payment
                                  .OrderByDescending(p => p.PaymentDate)
                                  .ToList();
            var totalRevenue = _context.Payment
                                        .Where(p => p.PaymentStatus == PaymentStatus.Completed)
                                        .Sum(p => p.Amount);
            return Ok(new { TotalRevenue = totalRevenue, Payments = sorted });
        }
    }
}