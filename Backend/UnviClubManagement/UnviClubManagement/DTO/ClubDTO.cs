using System.ComponentModel.DataAnnotations;

namespace UnviClubManagement.DTO
{
    public class ClubDTO
    {
        [Required]
        public string ClubName { get; set; }

        [Required]
        public string Desc { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public int ClubLeaderID { get; set; }
    }
}
