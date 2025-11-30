using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UnviClubManagement.Data.Models
{
    public class EventUpdate
    {
        [Key]
        [ForeignKey("Event")]
        public int Id { get; set; }

        public Event Event { get; set; }

        public string? OldName { get; set; }

        public string? NewName { get; set; }

        public DateTime? OldStart { get; set; }
        public DateTime? NewStart { get; set; }
        public DateTime? OldEnd { get; set; }
        public DateTime? NewEnd { get; set; }

        public string? OldDescription { get; set; }

        public string? NewDescription { get; set; }
    }
}
