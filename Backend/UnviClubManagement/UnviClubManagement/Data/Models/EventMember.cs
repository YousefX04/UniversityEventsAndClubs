using System.ComponentModel.DataAnnotations.Schema;

namespace UnviClubManagement.Data.Models
{
    public class EventMember
    {
        [ForeignKey("Event")]
        public int? EventID {  get; set; }

        public Event? Event { get; set; }

        [ForeignKey("User")]
        public int UserID { get; set; }

        public User User { get; set; }

        public string Status { get; set; }
    }
}
