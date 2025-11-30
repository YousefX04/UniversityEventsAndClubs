using System.ComponentModel.DataAnnotations;

namespace UnviClubManagement.DTO
{
    public class UpdateClubDTO
    {
        [Required]
        public string ClubName { get; set; }

        [Required]
        public string Desc { get; set; }

        public int ClubID { get; set; }
    }
}
