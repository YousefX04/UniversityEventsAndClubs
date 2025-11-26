using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UnviClubManagement.Data;
using UnviClubManagement.Data.Models;
using UnviClubManagement.DTO;
using UnviClubManagement.Enums;

namespace UnviClubManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClubController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ClubController(AppDbContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> AddClub([FromForm] ClubDTO model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var clubName = await _db.Clubs.FirstOrDefaultAsync(c => c.ClubName == model.ClubName);

            if(clubName != null)
            {
                return BadRequest("Name Already Exist");
            }


            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Id == model.ClubLeaderID);

            if(user == null || user.RoleID != 2)
            {
                return BadRequest("User Id does not exist");
            }

            var club = await _db.Clubs
                .FirstOrDefaultAsync(c => c.ClubLeaderID == model.ClubLeaderID);

            if (club != null)
            {
                return BadRequest("You Already have a club");
            }

            var newClub = new Club()
            {
                ClubName = model.ClubName,
                Description = model.Desc,
                ClubLeaderID = model.ClubLeaderID,
                Status = Status.Pending.ToString()
            };

            await _db.Clubs.AddAsync(newClub);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteClub(int id)
        {
            var club = await _db.Clubs.FirstOrDefaultAsync(c=> c.Id == id);

            if(club == null)
            {
                return BadRequest("id does not exist");
            }

            await _db.ClubMembers
                .Where(cm => cm.ClubID == id)
                .ExecuteDeleteAsync();
                

            _db.Clubs.Remove(club);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpPut]
        public async Task<IActionResult> UpdateClub([FromForm]UpdateClubDTO model)
        {
            var club = await _db.Clubs
                .FirstOrDefaultAsync(c => c.Id == model.ClubID);

            if(club == null)
            {
                return BadRequest("ClubID Does not exist");
            }

            var clubName = await _db.Clubs
                .FirstOrDefaultAsync(c => c.ClubName == model.ClubName);

            if (clubName != null)
            {
                return BadRequest("Name Already Exist");
            }

            var updatedClub = new ClubUpdate
            {
                Id = model.ClubID,
                OldName = club.ClubName,
                NewName = model.ClubName,
                OldDescription = club.Description,
                NewDescription = model.Desc,
            };

            await _db.ClubUpdates.AddAsync(updatedClub);

            await _db.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("GetAllClubs")]
        public async Task<IActionResult> GetAllClubs()
        {
            var clubs = await _db.Clubs
                .Include(c => c.User)
                .Where(c => c.Status == Status.Accepted.ToString())
                .Select(c => new {
                    c.Id,
                    c.ClubName,
                    c.Description,
                    c.User.UserName                   
                }).ToListAsync();

            return Ok(clubs);
        }

        [HttpGet("GetClub")]
        public async Task<IActionResult> GetClub(int clubleaderid)
        {
            var club = _db.Clubs
                .Include(c => c.User)
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Where(c => c.ClubLeaderID == clubleaderid && c.Status == Status.Accepted.ToString())
                .Select(c => new
                {
                    c.Id,
                    c.ClubName,
                    c.Description,
                    c.User.UserName,
                    Members = c.Members.Select(m => new
                    {
                        m.UserID,
                        m.User.UserName,
                        m.Status
                    }).ToList()
                });

            if(club == null)
            {
                return BadRequest("id does not exist");
            }

            return Ok(club);
        }


        [HttpPost("JoinClub/{clubId}")]
        public async Task<IActionResult> JoinClub(int studentId, int clubId)
        {
            await _db.ClubMembers.AddAsync(new ClubMember
            {
                ClubID = clubId,
                UserID = studentId,
                Status = Status.Pending.ToString()
            });

            await _db.SaveChangesAsync();

            return Ok();
        }
    }
}
