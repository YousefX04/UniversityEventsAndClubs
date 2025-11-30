using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UnviClubManagement.Data;
using UnviClubManagement.DTO;
using UnviClubManagement.Enums;

namespace UnviClubManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly AppDbContext _db;

        public StudentController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("Dashboard")]
        public async Task<IActionResult> GetDashboard(int studentId)
        {
            var numberOfJoinedClubs = await _db.ClubMembers
                .CountAsync(cm => cm.UserID == studentId && cm.Status == Status.Accepted.ToString());

            var numberOfJoinedEvents = await _db.EventMembers
                .CountAsync(em => em.UserID == studentId && em.Status == Status.Accepted.ToString());

            var clubList = await _db.ClubMembers
                .Where(cm => cm.UserID == studentId && cm.Status == Status.Accepted.ToString())
                .Select(cm => new ClubJoinedDTO
                {
                    ClubName = cm.Club.ClubName,
                    Desc = cm.Club.Description
                }).ToListAsync();

            var eventList = await _db.EventMembers
                .Where(em => em.UserID == studentId && em.Status == Status.Accepted.ToString())
                .Select(cm => new EventJoinedDTO
                {
                    EventName = cm.Event.EventName,
                    Desc = cm.Event.Description,
                    ClubName = cm.Event.Club.ClubName,
                    StartAt = cm.Event.StartAt,
                    EndAt = cm.Event.EndAt
                }).ToListAsync();

            var studentDashboard = new StudentDashboardDTO
            {
                NumOfJoinedClubs = numberOfJoinedClubs,
                NumOfJoinedEvents = numberOfJoinedEvents,
                JoinedClubs = clubList,
                JoinedEvents = eventList
            };

            return Ok(studentDashboard);
        }
    }
}
