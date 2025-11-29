using System.ComponentModel.DataAnnotations;

namespace UnviClubManagement.Data.Models
{
    public class Role
    {
        [Key]
        public int Id { get; set; }

        public string RoleName { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
