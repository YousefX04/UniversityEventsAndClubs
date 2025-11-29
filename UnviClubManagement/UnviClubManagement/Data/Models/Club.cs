using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UnviClubManagement.Data.Models
{
    public class Club
    {
        [Key]
        public int Id { get; set; }

        public string ClubName { get; set; }

        public DateTime CreatedAt { get; set; }

        public string Description { get; set; }

        [ForeignKey("User")]
        public int ClubLeaderID { get; set; }

        public User User { get; set; }

        public string Status {  get; set; }

        public ICollection<Event> Events { get; set; } = new List<Event>();

        public ICollection<ClubMember> Members { get; set; } = new List<ClubMember>();
    }
}
