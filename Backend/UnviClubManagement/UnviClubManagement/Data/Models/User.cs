using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UnviClubManagement.Data.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string UserName { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [Phone]
        public string Phone { get; set; }

        [ForeignKey("Role")]
        public int RoleID { get; set; }

        public Role Role { get; set; }

        public Club Club { get; set; } // for clubleader

        public ICollection<ClubMember> JoinedClubs { get; set; } = new List<ClubMember>();

        public ICollection<EventMember> JoinedEvents { get; set; } = new List<EventMember>();

    }
}
