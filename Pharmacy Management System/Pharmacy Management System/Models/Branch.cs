using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Pharmacy_Management_System.Models
{
    public class Branch
    {
        [Key]
        [JsonIgnore]
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
        [JsonIgnore]
        public List<StockLevel>? Stock { get; set; }

        //1:M relationship with Order
        [JsonIgnore]
        public List<Order>? Orders { get; set; }
    }
}
