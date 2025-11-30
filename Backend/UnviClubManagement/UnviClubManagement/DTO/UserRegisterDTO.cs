using System.ComponentModel.DataAnnotations;

namespace UnviClubManagement.DTO
{
    public class UserRegisterDTO
    {
        [Required(ErrorMessage = "UserName is required")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters long")]
        [DataType(DataType.Password)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$",
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, and one number")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Phone is required")]
        [StringLength(11, ErrorMessage ="Phone Must be At most 11 numbers")]
        public string Phone { get; set; }

        [Required]
        public string RoleName { get; set; }

    }
}
