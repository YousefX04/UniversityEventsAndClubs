using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UnviClubManagement.Data.Models
{
    public class Event
    {
        [Key]
        public int Id { get; set; }

        public string EventName { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime StartAt { get; set; }

        public DateTime EndAt { get; set; }

        public string Description { get; set; }

        public string Status { get; set; }

        [ForeignKey("Club")]
        public int ClubID { get; set; }

        public Club Club { get; set; }

        public ICollection<EventMember> Members { get; set; } = new List<EventMember>();
    }
}
