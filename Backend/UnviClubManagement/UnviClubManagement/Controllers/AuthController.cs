using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using System.Runtime.CompilerServices;
using UnviClubManagement.Data;
using UnviClubManagement.Data.Models;
using UnviClubManagement.DTO;

namespace UnviClubManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AuthController(AppDbContext db)
        {
            _db = db;
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromForm]UserLoginDTO model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _db.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == model.Email && u.Password == model.Password);

            if (user == null) 
            { 
                return BadRequest("Email or password not valid");
            }

            return Ok( new {
                Id= user.Id ,
                UserName = user.UserName ,
                RoleName = user.Role.RoleName}
            );
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromForm] UserRegisterDTO model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == model.Email);

            if(user != null)
            {
                return BadRequest("Email already exist");
            }

            var role = await _db.Roles
                .Where(r => r.RoleName == model.RoleName)
                .FirstOrDefaultAsync();

            if(role == null)
            {
                return BadRequest("Role Does not exist");
            }

            var newUser = new User()
            {
                UserName = model.UserName , 
                Password = model.Password ,
                Email = model.Email ,
                Phone = model.Phone ,
                RoleID = role.Id
            };

            await _db.Users.AddAsync(newUser);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                Id = newUser.Id,
                UserName = newUser.UserName,
                RoleName = role.RoleName
            }
            );
        }
    }
}
