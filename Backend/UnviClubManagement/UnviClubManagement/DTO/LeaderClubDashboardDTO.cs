using System.ComponentModel.DataAnnotations;

namespace UnviClubManagement.DTO
{
    public class LeaderClubDashboardDTO
    {
        public string ClubName { get; set; } = string.Empty;
        public string ClubStatus { get; set; } = string.Empty;
        public int TotalMembers { get; set; }
        public int PendingRequests { get; set; }
        public int TotalEvents { get; set; }
        public int PendingEvents { get; set; }
    }
}