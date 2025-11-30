using System.ComponentModel.DataAnnotations;

namespace UnviClubManagement.DTO
{
    public class EventDTO
    {
        [Required]
        public string EventName { get; set; }

        [Required]
        public string Desc { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime StartAt { get; set; } 

        public DateTime EndAt { get; set; } 

        public int ClubID { get; set; }
    }
}
