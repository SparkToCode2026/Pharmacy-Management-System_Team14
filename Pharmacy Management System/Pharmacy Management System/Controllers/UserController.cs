using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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



        // Register a new user
        [HttpPost("register")]
        public IActionResult Register(User U)
        {
            //Check if the username or email already exists in the database
            bool userExists = _context.User.Any(u => u.Username == U.Username || u.Email == U.Email);
            if (userExists)
            {
                return BadRequest("Username or Email is already taken.");
            }
            // Hash the password before saving it to the database
            U.Password = BCrypt.Net.BCrypt.HashPassword(U.Password);
            _context.User.Add(U);
            _context.SaveChanges();
            return Ok(U.UserId);
        }




        // Update the username and email of a user
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





        // Update the password of a user
        [HttpPatch("{id}/password")]
        public IActionResult UpdatePassword(int id, string newPassword)
        {
            //Check if the user exists in the database
            var user = _context.User.Find(id);
            if (user == null)
            {
                return NotFound();
            }
            // Hash the new password before saving it to the database
            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            
            _context.SaveChanges();
            return Ok(user);
        }

        // Delete a user
        [HttpDelete("{id}")]
        public IActionResult DeleteUser(int id)
        {
            //Check if the user exists in the database
            var user = _context.User.Find(id);
            if (user == null)
            {
                return NotFound();
            }
            _context.User.Remove(user);
            _context.SaveChanges();
            return Ok("User deleted successfully.");
        }


        // Get a list of all users along with their related entity
        [HttpGet]
        public IActionResult getAllUsers()
        {
            // Retrieve all users including their related entity 
            var users = _context.User
                                .Include(u => u.CustomerProfile)
                                .ToList();

            return Ok(users);
        }


        // Get a specific user by ID along with their related entity
        [HttpGet("{id}")]
        public IActionResult getUser(int id) {
            // Retrieve the user by ID including their related entity
            var user = _context.User
                                .Include(u => u.CustomerProfile)
                                .FirstOrDefault(u => u.UserId == id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }



        [HttpGet("search")]
        public IActionResult SearchUsers(string? search)
        {
            // Retrieve users based on the search query, including their related entity
            var query = _context.User
                        .Include(u => u.CustomerProfile)
                        .AsQueryable();

            // If a search query is provided, filter the users based on the username or email
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(u => u.Username.Contains(search) || u.Email.Contains(search));
            }

            
            var users = query.ToList();
            return Ok(users);
        }



        [HttpGet("SortByID")]
        public IActionResult SortbyID()
        {
            var user = _context.User
                                .Include(u => u.CustomerProfile)
                                .OrderBy(u => u.UserId)
                                .ToList();
            return Ok(user);
        }
    }
}
