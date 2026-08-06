using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pharmacy_Management_System.Models
{
    public class Branch
    {
        [Key]
        public int BranchId { get; set; }
        [Required]
        public string BranchName { get; set; }
        [Required]
        public string BranchAddress { get; set; }
        [Required]
        public string BranchCity { get; set; }
        [Required, Phone]
        public int BranchPhone { get; set; }


        //1:M relationship with StockLevel
        public List<StockLevel> Stock { get; set; }

        //1:M relationship with Order
        public List<Order> Orders { get; set; }
    }
}
