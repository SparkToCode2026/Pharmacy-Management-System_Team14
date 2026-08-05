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


        [HttpPost("register")]
        public IActionResult Register(User U)
        {
            //Check if the username or email already exists in the database
            bool userExists = _context.User.Any(u => u.Username == U.Username || u.Email == U.Email);
            if (userExists)
            {
                return BadRequest("Username or Email is already taken.");
            }
            _context.User.Add(U);
            _context.SaveChanges();
            return Ok(U.UserId);
        }
        [HttpPut("{id}")]
        public IActionResult UpdateUser(int id, User U)
        {
            //Check if the user exists in the database
            var user = _context.User.Find(id);
            if (user == null)
            {
                return NotFound();
            }
            user.Username = U.Username;
            user.Email = U.Email;
            
            _context.SaveChanges();
            return Ok(user);
        }

    }
}
