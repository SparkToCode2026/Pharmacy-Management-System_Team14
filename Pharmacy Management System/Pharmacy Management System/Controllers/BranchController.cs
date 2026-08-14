using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pharmacy_Management_System.Models;
using System.Collections.Generic;
using System.Linq;

namespace Pharmacy_Management_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BranchController : ControllerBase
    {
        private readonly ProjectContext _context;

        public BranchController(ProjectContext context)
        {
            _context = context;
        }

        // Add a new branch (Admin / Pharmacist)
        [Authorize(Roles = "1,2")]
        [HttpPost("AddBranch")]
        public IActionResult AddBranch([FromBody] Branch b)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Branches.Add(b);
            _context.SaveChanges();
            return Ok(b.BranchId);
        }

        // Update all fields of a branch (Admin / Pharmacist)
        [Authorize(Roles = "1,2")]
        [HttpPut("UpdateAllBranch/{id}")]
        public IActionResult UpdateAllBranch(int id, [FromBody] Branch newBranch)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Branch? b = _context.Branches.FirstOrDefault(branch => branch.BranchId == id);
            if (b == null)
            {
                return NotFound("Branch not found.");
            }

            b.BranchName = newBranch.BranchName;
            b.BranchAddress = newBranch.BranchAddress;
            b.BranchCity = newBranch.BranchCity;
            b.BranchPhone = newBranch.BranchPhone;

            _context.SaveChanges();
            return Ok("Branch updated successfully.");
        }

        // Update branch name only (Admin / Pharmacist)
        [Authorize(Roles = "1,2")]
        [HttpPatch("UpdateBranchName/{id}")]
        public IActionResult UpdateBranchName(int id, [FromBody] string newName)
        {
            if (string.IsNullOrWhiteSpace(newName))
            {
                return BadRequest("Branch name cannot be empty.");
            }

            Branch? b = _context.Branches.FirstOrDefault(branch => branch.BranchId == id);
            if (b == null)
            {
                return NotFound("Branch not found.");
            }

            b.BranchName = newName;
            _context.SaveChanges();
            return Ok("Branch name updated successfully.");
        }

        // Remove a branch (Admin / Pharmacist)
        [Authorize(Roles = "1,2")]
        [HttpDelete("RemoveBranch/{id}")]
        public IActionResult RemoveBranch(int id)
        {
            Branch? b = _context.Branches.FirstOrDefault(branch => branch.BranchId == id);
            if (b == null)
            {
                return NotFound("Branch not found.");
            }

            _context.Branches.Remove(b);
            _context.SaveChanges();
            return Ok("Branch removed successfully.");
        }

        // Get all branches (Public access)
        [AllowAnonymous]
        [HttpGet("GetAllBranch")]
        public IActionResult GetAllBranch()
        {
            List<Branch> branches = _context.Branches.ToList();
            return Ok(branches);
        }

        // Get a single branch by id (Public access)
        [AllowAnonymous]
        [HttpGet("GetBranch/{id}")]
        public IActionResult GetBranch(int id)
        {
            Branch? b = _context.Branches.FirstOrDefault(branch => branch.BranchId == id);
            if (b == null)
            {
                return NotFound("Branch not found.");
            }
            return Ok(b);
        }

        // Filter branches by city (Public access)
        [AllowAnonymous]
        [HttpGet("GetByBranchCity")]
        public IActionResult GetByBranchCity([FromQuery] string city)
        {
            if (string.IsNullOrWhiteSpace(city))
            {
                return BadRequest("City search term cannot be empty.");
            }

            List<Branch> branches = _context.Branches
                .Where(b => b.BranchCity.ToLower().Contains(city.ToLower()))
                .ToList();

            return Ok(branches);
        }

        // Count total branches (Public access)
        [AllowAnonymous]
        [HttpGet("GetTotalBranches")]
        public IActionResult GetTotalBranches()
        {
            int total = _context.Branches.Count();
            return Ok(new { TotalBranches = total });
        }
    }
}