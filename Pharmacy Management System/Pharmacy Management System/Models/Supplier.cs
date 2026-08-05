using System.ComponentModel.DataAnnotations;

namespace Pharmacy_Management_System.Models
{
    public class Supplier
    {
        // Primary Key
        [Key]
        public int SupplierId { get; set; }


        // Supplier information
        [Required]
        public string SupplierName { get; set; } = string.Empty;

        [Required]
        public string SupplierEmail { get; set; } = string.Empty;

        [Required]
        public string SupplierPhone { get; set; } = string.Empty;

        [Required]
        public string SupplierAddress { get; set; } = string.Empty;


    }
}
