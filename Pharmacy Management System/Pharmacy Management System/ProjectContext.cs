using Microsoft.EntityFrameworkCore;
using Pharmacy_Management_System.Models;
using PharmacyManagementSystem.Models;

namespace Pharmacy_Management_System
{
    public class ProjectContext : DbContext
    {
        public DbSet<Manufacturer> Manufacturer { get; set; }
        public DbSet<User> User { get; set; }
        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<MedicineCategory> MedicineCategories { get; set; }
        public DbSet<Order> Order { get; set; }
        public DbSet<OrderItem> OrderItem { get; set; }

    }
}
