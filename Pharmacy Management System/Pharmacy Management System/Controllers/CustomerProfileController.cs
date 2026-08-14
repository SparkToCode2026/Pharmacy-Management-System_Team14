using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy_Management_System.Models;

namespace Pharmacy_Management_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CustomerProfileController : ControllerBase
    {
        private readonly ProjectContext _context;

        public CustomerProfileController(ProjectContext context)
        {
            _context = context;
        }

        // Add profile for the currently authenticated user
        [HttpPost("AddCustomerProfile")]
        public async Task<IActionResult> AddCustomerProfile([FromBody] CustomerProfile cp)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("User ID not found in token.");
            }

            cp.UserId = int.Parse(userIdClaim);

            ModelState.Remove("UserId");
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var profileExists = await _context.CustomerProfiles.AnyAsync(p => p.UserId == cp.UserId);
            if (profileExists)
            {
                return BadRequest("A profile already exists for this user.");
            }

            _context.CustomerProfiles.Add(cp);
            await _context.SaveChangesAsync();

            return Ok(cp.CustomerId);
        }

        // Update profile
        [HttpPut("UpdateAllCustomerProfile/{id}")]
        public async Task<IActionResult> UpdateAllCustomerProfile(int id, [FromBody] CustomerProfile newProfile)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var p = await _context.CustomerProfiles.FirstOrDefaultAsync(profile => profile.CustomerId == id);
            if (p == null)
            {
                return NotFound("Customer Profile not found.");
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "1" && userRole != "2" && p.UserId.ToString() != userIdClaim)
            {
                return Forbid();
            }

            p.CustomerPhone = newProfile.CustomerPhone;
            p.CustomerAddress = newProfile.CustomerAddress;
            p.DateOfBirth = newProfile.DateOfBirth;

            await _context.SaveChangesAsync();
            return Ok("Customer Profile updated successfully.");
        }

        // Update phone number only
        [HttpPatch("UpdateCustomerPhone/{id}")]
        public async Task<IActionResult> UpdateCustomerPhone(int id, [FromBody] int newPhone)
        {
            var p = await _context.CustomerProfiles.FirstOrDefaultAsync(profile => profile.CustomerId == id);
            if (p == null)
            {
                return NotFound("Customer Profile not found.");
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "1" && userRole != "2" && p.UserId.ToString() != userIdClaim)
            {
                return Forbid();
            }

            p.CustomerPhone = newPhone;
            await _context.SaveChangesAsync();

            return Ok("Customer phone updated successfully.");
        }

        // Delete profile
        [HttpDelete("DeleteCustomerProfile/{id}")]
        public async Task<IActionResult> DeleteCustomerProfile(int id)
        {
            var p = await _context.CustomerProfiles.FirstOrDefaultAsync(profile => profile.CustomerId == id);
            if (p == null)
            {
                return NotFound("Customer Profile not found.");
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "1" && userRole != "2" && p.UserId.ToString() != userIdClaim)
            {
                return Forbid();
            }

            _context.CustomerProfiles.Remove(p);
            await _context.SaveChangesAsync();

            return Ok("Customer profile removed successfully.");
        }

        // Get all customer profiles (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpGet("GetAllCustomerProfiles")]
        public async Task<IActionResult> GetAllCustomerProfiles()
        {
            var profiles = await _context.CustomerProfiles.ToListAsync();
            return Ok(profiles);
        }

        // Get single customer profile by id
        [HttpGet("GetCustomerProfile/{id}")]
        public async Task<IActionResult> GetCustomerProfile(int id)
        {
            var p = await _context.CustomerProfiles
                .FirstOrDefaultAsync(profile => profile.CustomerId == id);

            if (p == null)
            {
                return NotFound("Customer Profile not found.");
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "1" && userRole != "2" && p.UserId.ToString() != userIdClaim)
            {
                return Forbid();
            }

            return Ok(p);
        }

        // Filter profiles by address (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpGet("GetByAddress")]
        public async Task<IActionResult> GetByAddress([FromQuery] string address)
        {
            if (string.IsNullOrWhiteSpace(address))
            {
                return BadRequest("Address search parameter cannot be empty.");
            }

            var profiles = await _context.CustomerProfiles
                .Where(p => p.CustomerAddress.ToLower().Contains(address.ToLower()))
                .ToListAsync();

            return Ok(profiles);
        }

        // Count total customer profiles (Admin / Pharmacist only)
        [Authorize(Roles = "1,2")]
        [HttpGet("GetTotalProfiles")]
        public async Task<IActionResult> GetTotalProfiles()
        {
            int total = await _context.CustomerProfiles.CountAsync();
            return Ok(new { TotalCustomerProfiles = total });
        }
    }
}