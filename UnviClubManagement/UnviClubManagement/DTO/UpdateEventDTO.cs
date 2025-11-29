using System.ComponentModel.DataAnnotations;

namespace UnviClubManagement.DTO
{
    public class UpdateEventDTO
    {
        [Required]
        public string EventName { get; set; }

        [Required]
        public string Desc { get; set; }

        public DateTime? StartAt { get; set; }
        public DateTime? EndAt { get; set; }

        public int EventID { get; set; }
    }
}
