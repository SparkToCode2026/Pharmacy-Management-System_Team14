using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Pharmacy_Management_System.Models
{
    public class Supplier
    {
        // Primary Key
        [Key]
        [JsonIgnore]
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



        // 1:N Relationship with Medicine

        [JsonIgnore]
        public List<Medicine>? Medicines { get; set; } = new List<Medicine>();

    }
}
