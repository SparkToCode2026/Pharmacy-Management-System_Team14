using Microsoft.AspNetCore.Mvc;
using Pharmacy_Management_System.Models;

namespace Pharmacy_Management_System.Controllers
{
    [ApiController]
    [Route("CustomerProfile")]
    public class CustomerProfileController : ControllerBase
    {
        private ProjectContext context;

        public CustomerProfileController(ProjectContext _context)
        {
            context = _context;
        }

        [HttpPost("AddCustomerProfile")]
        public IActionResult AddCustomerProfile(CustomerProfile cp)
        {
            context.CustomerProfiles.Add(cp);
            context.SaveChanges();
            return Ok(cp.CustomerId);
        }

        [HttpPut("UpdateAllCustomerProfile")]
        public IActionResult UpdateAllCustomerProfile(int id, CustomerProfile newProfile)
        {
            CustomerProfile p = context.CustomerProfiles.FirstOrDefault(p => p.CustomerId == id);
            if (p == null)
            {
                return NotFound("Customer Profile not found.");
            }
            else
            {
                p.CustomerPhone = newProfile.CustomerPhone;
                p.CustomerAddress = newProfile.CustomerAddress;
                p.DateOfBirth = newProfile.DateOfBirth;
                context.SaveChanges();
                return Ok("Customer Profile updated successfully.");
            }
        }

        [HttpPatch("UpdateCustomerPhone")]
        public IActionResult UpdateCustomerPhone(int id, int newPhone)
        {
            CustomerProfile p = context.CustomerProfiles.FirstOrDefault(p => p.CustomerId == id);
            if (p == null)
            {
                return NotFound("Customer Profile not found.");
            }
            else
            {
                p.CustomerPhone = newPhone;
                context.SaveChanges();
                return Ok("Customer phone updated successfully.");
            }
        }

        [HttpDelete("DeleteCustomerProfile")]
        public IActionResult DeleteCustomerProfile(int id)
        {
            CustomerProfile p = context.CustomerProfiles.FirstOrDefault(p => p.CustomerId == id);
            if (p == null)
            {
                return NotFound("Customer Profile not found.");
            }
            context.CustomerProfiles.Remove(p);
            context.SaveChanges();
            return Ok("Customer profile removed successfully.");
        }

        //Get all customer profiles
        [HttpGet("GetAllCustomerProfiles")]
        public IActionResult GetAllCustomerProfiles()
        {
            List<CustomerProfile> p = context.CustomerProfiles.ToList();
            return Ok(p);
        }

        // Get a single customer profile by id
        [HttpGet("GetCustomerProfile")]
        public IActionResult GetCustomerProfile(int id)
        {
            CustomerProfile p = context.CustomerProfiles.FirstOrDefault(p => p.CustomerId == id);
            if (p == null)
            {
                return NotFound("Customer Profile not found.");
            }
            return Ok(p);
        }

        // Filter customer profiles using LINQ (Where)
        [HttpGet("GetByAddress")]
        public IActionResult GetByAddress(string Address)
        {
            List<CustomerProfile> p = context.CustomerProfiles.Where(p => p.CustomerAddress == (Address)).ToList();
            return Ok(p);
        }

        // Count the number of Profiles 
        [HttpGet("GetTotalProfiles")]
        public IActionResult GetTotalProfiles()
        {
            int total = context.CustomerProfiles.Count();
            return Ok("Total customer profiles: " + total);
        }

    }
}
