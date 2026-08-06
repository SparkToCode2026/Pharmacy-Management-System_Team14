using Microsoft.EntityFrameworkCore;
using Pharmacy_Management_System.Models;


namespace Pharmacy_Management_System
{
    public class ProjectContext : DbContext
    {
        public DbSet<Manufacturer> Manufacturers { get; set; }
        public DbSet<User> Users { get; set; }

        public DbSet<Branch> Branches { get; set; }
        public DbSet<CustomerProfile> CustomerProfiles { get; set; }
        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<MedicineCategory> MedicineCategories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<StockLevel> StockLevels { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }

        // Backwards-compatible singular property names used elsewhere in the codebase
        public DbSet<Manufacturer> Manufacturer => Manufacturers;
        public DbSet<User> User => Users;
        public DbSet<Branch> Branch => Branches;
        public DbSet<CustomerProfile> CustomerProfile => CustomerProfiles;
        public DbSet<Order> Order => Orders;
        public DbSet<OrderItem> OrderItem => OrderItems;
        public DbSet<StockLevel> StockLevel => StockLevels;
        public DbSet<Payment> Payment => Payments;

    }
}
