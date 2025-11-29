using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UnviClubManagement.Data.Models
{
    public class ClubUpdate
    {
        [Key]
        [ForeignKey("Club")]
        public int Id { get; set; }

        public Club Club { get; set; }

        public string? OldName { get; set; }

        public string? NewName { get; set; }

        public string? OldDescription { get; set; }

        public string? NewDescription { get; set; }
    }
}
