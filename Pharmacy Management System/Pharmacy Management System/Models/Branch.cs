using System.ComponentModel.DataAnnotations.Schema;

namespace Pharmacy_Management_System.Models
{
    public class Branch
    {
        public int BranchId { get; set; }
        public string BranchName { get; set; }
        public string BranchAddress { get; set; }
        public string BranchCity { get; set; }
        public int BranchPhone { get; set; }


        //1:M relationship with StockLevel
        public List<StockLevel> Stock { get; set; }

        //1:M relationship with Order
        public List<Order> Orders { get; set; }
    }
}
