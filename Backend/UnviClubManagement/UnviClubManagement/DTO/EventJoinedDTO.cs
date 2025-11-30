using System.ComponentModel.DataAnnotations;

namespace UnviClubManagement.DTO
{
    public class EventJoinedDTO
    {       
        public string EventName { get; set; }
        public string ClubName { get; set; }     
        public string Desc { get; set; }
        public DateTime StartAt { get; set; }
        public DateTime EndAt { get; set; }
    }
}
