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


    }
}
