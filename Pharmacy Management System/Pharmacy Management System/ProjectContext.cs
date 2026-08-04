using Microsoft.EntityFrameworkCore;
using Pharmacy_Management_System.Models;

namespace Pharmacy_Management_System
{
    public class ProjectContext : DbContext
    {
        public DbSet<User> User { get; set; }
    }
}
