using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Pharmacy_Management_System.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
namespace Pharmacy_Management_System.Controllers
{
    [ApiController]
    [Route("User")]
    public class UserController : ControllerBase
    {
        private ProjectContext _context;
        public UserController(ProjectContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        private readonly IConfiguration _configuration;


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
            if (U.RoleId == null || U.RoleId == 0)
            {
                U.RoleId = 3;
            }
            // Hash the password before saving it to the database
            U.Password = BCrypt.Net.BCrypt.HashPassword(U.Password);
            _context.User.Add(U);
            _context.SaveChanges();
            return Ok(U.UserId);
        }




        // Update the username and email of a user
        [HttpPut("UpdateUser")]
        public IActionResult UpdateUser(int id, [FromBody] User U)
        {
            // Check if the user exists in the database
            var user = _context.User.Find(id);
            if (user == null)
            {
                return NotFound();
            }

            user.Username = U.Username;
            user.Email = U.Email;
            if (U.RoleId > 0)
            {
                user.RoleId = U.RoleId;
            }

            // Remove Password and Role from ModelState validation checks
            ModelState.Remove("Password");
            ModelState.Remove("Role");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.SaveChanges();
            return Ok(user);
        }





        // Update the password of a user
        [HttpPatch("UpdatePassword")]
        public IActionResult UpdatePassword(int id, [FromBody] string newPassword)
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
        [HttpDelete("DeleteUser")]
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
        [HttpGet("GetAllUsers")]
        public IActionResult getAllUsers()
        {
            // Retrieve all users including their related entity 
            var users = _context.User
                                .Include(u => u.CustomerProfile)
                                .ToList();

            return Ok(users);
        }


        // Get a specific user by ID along with their related entity
        [HttpGet("GetUserById")]
        public IActionResult getUser(int id)
        {
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
        public IActionResult SearchUsers([FromQuery] string? search)
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


        // Sort users by ID in ascending order
        [HttpGet("SortByID")]
        public IActionResult SortbyID()
        {
            // Retrieve all users including their related entity and sort them by ID in ascending order
            var user = _context.User
                                .Include(u => u.CustomerProfile)
                                .OrderBy(u => u.UserId)
                                .ToList();
            return Ok(user);
        }


        // Login endpoint with BCrypt password verification
        [HttpPost("login")]
        public IActionResult Login([FromBody] User loginData)
        {
            // Find user by Username or Email
            var user = _context.User
                .FirstOrDefault(u => u.Username == loginData.Username || u.Email == loginData.Email);

            if (user == null)
            {
                return BadRequest("Invalid username or password.");
            }

            // Verify the hashed password using BCrypt
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginData.Password, user.Password);
            if (!isPasswordValid)
            {
                return BadRequest("Invalid username or password.");
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                Token = token,
                UserId = user.UserId,
                Role = user.Role
            });

        }
        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Role, user.RoleId?.ToString() ?? "3")
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
    


