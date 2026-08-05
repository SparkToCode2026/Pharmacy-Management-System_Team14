using Microsoft.AspNetCore.Mvc;
using Pharmacy_Management_System.Models;
namespace Pharmacy_Management_System.Controllers
{
    [ApiController]
    [Route("User")]
    public class UserController : ControllerBase
    {
        private ProjectContext _context;
        public UserController(ProjectContext context)
        {
            _context = context;
        }
        public IActionResult Register(User U)
        {
            bool userExists = _context.User.Any(u => u.Username == U.Username || u.Email == U.Email);
            if (userExists)
            {
                return BadRequest("Username or Email is already taken.");
            }
            _context.User.Add(U);
            _context.SaveChanges();
            return Ok(U.UserId);
        }

    }
}
