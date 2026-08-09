using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Pharmacy_Management_System.Models;

namespace Pharmacy_Management_System.Controllers
{
    [ApiController]
    [Route("Branch")]
    public class BranchController : ControllerBase  
    {
        private ProjectContext context;

        public BranchController(ProjectContext _context)
        {
            context = _context;
        }

        [HttpPost("AddBranch")]
        public IActionResult AddBranch(Branch b)
        {
            context.Branches.Add(b);
            context.SaveChanges();
            return Ok(b.BranchId);
        }

        [HttpPut("UpdateAllBranch")]
        public IActionResult UpdateAllBranch(int id, Branch newBranch)
        {
            Branch b = context.Branches.FirstOrDefault(b => b.BranchId == id);
            if (b == null)
            {
                return NotFound("Branch not found.");
            }
            else
            {
                b.BranchName = newBranch.BranchName;
                b.BranchAddress = newBranch.BranchAddress;
                b.BranchCity = newBranch.BranchCity;
                b.BranchPhone = newBranch.BranchPhone;
                context.SaveChanges();
                return Ok("Branch updated successfully.");
            }
        }

        [HttpPatch("UpdateBranchName")]
        public IActionResult UpdateBranchName(int id, string newName)
        {
            Branch b = context.Branches.FirstOrDefault(b => b.BranchId == id);
            if (b == null)
            {
                return NotFound("Branch not found.");
            }
            else
            {
                b.BranchName = newName;
                context.SaveChanges();
                return Ok("Branch name updated successfully.");
            }
        }

        [HttpDelete("RemoveBranch")]
        public IActionResult RemoveBranch(int id)
        {
            Branch b = context.Branches.FirstOrDefault(b => b.BranchId == id);
            if (b == null)
            {
                return NotFound("Branch not found.");
            }
            context.Branches.Remove(b);
            context.SaveChanges();
            return Ok("Branch removed successfully.");
        }

        //Get all branches
        [HttpGet("GetAllBranch")]
        public IActionResult GetAllBranch()
        {
            List<Branch> b = context.Branches.ToList();
            return Ok(b);
        }

        // Get a single branch by id
        [HttpGet("GetBranch")]
        public IActionResult GetBranch(int id)
        {
            Branch b = context.Branches.FirstOrDefault(b => b.BranchId == id);
            if (b == null)
            {
                return NotFound("Branch not found.");
            }
            return Ok(b);
        }

        // Filter branches using LINQ (Where)
        [HttpGet("GetByBranchCity")]
        public IActionResult GetByBranchCity(string city)
        {
            List<Branch> b = context.Branches.Where(b => b.BranchCity == (city)).ToList();
            return Ok(b);
        }

        // Count the number of branches
        [HttpGet("GetTotalBranches")]
        public IActionResult GetTotalBranches()
        {
            int total = context.Branches.Count();
            return Ok("Total branches: " + total);
        }
    }
}
