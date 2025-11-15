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
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AdminController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("PendingClubs")]
        public async Task<IActionResult> GetAllClubs()
        {
            var clubs = await _db.Clubs
                .Include(c => c.User)
                .Where(c => c.Status == Status.Pending.ToString())
                .Select(c => new {
                    c.Id,
                    c.ClubName,
                    c.Description,
                    c.User.UserName
                }).ToListAsync();

            return Ok(clubs);
        }

        [HttpPut("AcceptClubRequest")]
        public async Task<IActionResult> AcceptStatusClub(int clubId)
        {
            var club = await _db.Clubs.FirstOrDefaultAsync(c => c.Id == clubId);

            if (club == null || club.Status != Status.Pending.ToString())
            {
                return BadRequest("id does not exist or its not pending");
            }

            club.Status = Status.Accepted.ToString();

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("RejectClubRequest")]
        public async Task<IActionResult> RejectStatusClub(int clubId)
        {
            var club = await _db.Clubs.FirstOrDefaultAsync(c => c.Id == clubId);

            if (club == null || club.Status != Status.Pending.ToString())
            {
                return BadRequest("id does not exist or its not pending");
            }

            club.Status = Status.Rejected.ToString();

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("PendingEvents")]
        public async Task<IActionResult> GetAllEvents()
        {
            var events = await _db.Events
                .Include(e => e.Club)
                .Where(e => e.Status == Status.Pending.ToString())
                .Select(e => new {
                    e.Id,
                    e.EventName,
                    e.Description,
                    e.Club.ClubName,
                    e.StartAt,
                    e.EndAt
                }).ToListAsync();

            return Ok(events);
        }

        [HttpPut("AcceptEventRequest")]
        public async Task<IActionResult> AcceptStatusEvent(int eventId)
        {
            var _event = await _db.Events.FirstOrDefaultAsync(e => e.Id == eventId);

            if (_event == null || _event.Status != Status.Pending.ToString())
            {
                return BadRequest("id does not exist or its not pending");
            }

            _event.Status = Status.Accepted.ToString();

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("RejectEventRequest")]
        public async Task<IActionResult> RejectStatusEvent(int eventId)
        {
            var _event = await _db.Events.FirstOrDefaultAsync(e => e.Id == eventId);

            if (_event == null || _event.Status != Status.Pending.ToString())
            {
                return BadRequest("id does not exist or its not pending");
            }

            _event.Status = Status.Rejected.ToString();

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("Dashboard")]
        public async Task<IActionResult> Dashboard()
        {
            int countOfPendingClubs = _db.Clubs.Where(c => c.Status == Status.Pending.ToString()).Count();
            int countOfAcceptedClubs = _db.Clubs.Where(c => c.Status == Status.Accepted.ToString()).Count();
            int countOfPendingEvents = _db.Events.Where(e => e.Status == Status.Pending.ToString()).Count();
            int countOfAcceptedEvents = _db.Events.Where(e => e.Status == Status.Accepted.ToString()).Count();
            int countOfClubLeaders = _db.Users.Where(u => u.RoleID == 2).Count();
            int countOfStudents = _db.Users.Where(u => u.RoleID == 3).Count();

            var dashboard = new AdminDashboardDTO()
            {
                NumOfAcceptedClubs = countOfAcceptedClubs,
                NumOfPendingClubs = countOfPendingClubs,
                NumOfAcceptedEvents = countOfAcceptedEvents,
                NumOfPendingEvents = countOfPendingEvents,
                NumOfLeadersClub = countOfClubLeaders,
                NumOfStudents = countOfStudents
            };

            return Ok(dashboard);
        }
    }
}
