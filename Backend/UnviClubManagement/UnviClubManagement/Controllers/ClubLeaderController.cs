using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UnviClubManagement.Data;
using UnviClubManagement.DTO;  // Added DTO namespace
using UnviClubManagement.Enums;

namespace UnviClubManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClubLeaderController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ClubLeaderController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("PendingJoinClubRequest")]
        public async Task<IActionResult> GetPendingJoinClubRequests(int clubLeaderId)
        {
            var pendingMembers = await _db.ClubMembers
                .Where(cm => cm.Status == Status.Pending.ToString() && cm.Club.ClubLeaderID == clubLeaderId)
                .Include(cm => cm.User)
                .Select(cm => new
                {
                    cm.User.Id,
                    cm.User.UserName,
                })
                .ToListAsync();

            return Ok(pendingMembers);
        }

        [HttpPut("AcceptJoinClubRequest")]
        public async Task<IActionResult> AcceptJoinClubRequest(int memberId)
        {
            var member = await _db.Users.FirstOrDefaultAsync(m => m.Id == memberId);

            if (member == null)
            {
                return BadRequest("id does not exist");
            }

            var cMember = await _db.ClubMembers.FirstOrDefaultAsync(m => m.UserID == memberId);

            if (cMember == null || cMember.Status != Status.Pending.ToString())
            {
                return BadRequest("id does not exist or its not pending");
            }

            cMember.Status = Status.Accepted.ToString();

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("RejectJoinClubRequest")]
        public async Task<IActionResult> RejectJoinClubRequest(int memberId)
        {
            var member = await _db.Users.FirstOrDefaultAsync(m => m.Id == memberId);

            if (member == null)
            {
                return BadRequest("id does not exist");
            }

            var cMember = await _db.ClubMembers.FirstOrDefaultAsync(m => m.UserID == memberId);

            if (cMember == null || cMember.Status != Status.Pending.ToString())
            {
                return BadRequest("id does not exist or its not pending");
            }

            cMember.Status = Status.Rejected.ToString();

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("KickClubMember/{memberId}")]
        public async Task<IActionResult> KickClubMember(int memberId)
        {
            var member = await _db.Users.FirstOrDefaultAsync(m => m.Id == memberId);

            if (member == null)
            {
                return BadRequest("id does not exist");
            }

            var cMember = await _db.ClubMembers.FirstOrDefaultAsync(m => m.UserID == memberId);

            if (cMember == null || cMember.Status != Status.Accepted.ToString())
            {
                return BadRequest("id does not exist or its not Accepted");
            }

            await _db.EventMembers.Where(em => em.UserID == memberId)
                .ExecuteDeleteAsync();

            _db.ClubMembers.Remove(cMember);

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("PendingJoinEventRequest")]
        public async Task<IActionResult> GetPendingJoinEventRequest(int clubLeaderId)
        {
            var pendingMembers = await _db.EventMembers
                .Where(em => em.Status == Status.Pending.ToString() && em.Event.Club.ClubLeaderID == clubLeaderId)
                .Include(em => em.User)
                .Select(em => new
                {
                    em.User.Id,
                    em.User.UserName,
                })
                .ToListAsync();

            return Ok(pendingMembers);
        }

        [HttpPut("AcceptJoinEventRequest")]
        public async Task<IActionResult> AcceptJoinEventRequest(int memberId)
        {
            var member = await _db.Users.FirstOrDefaultAsync(m => m.Id == memberId);

            if (member == null)
            {
                return BadRequest("id does not exist");
            }

            var eMember = await _db.EventMembers.FirstOrDefaultAsync(m => m.UserID == memberId);

            if (eMember == null || eMember.Status != Status.Pending.ToString())
            {
                return BadRequest("id does not exist or its not pending");
            }

            eMember.Status = Status.Accepted.ToString();

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("RejectJoinEventRequest")]
        public async Task<IActionResult> RejectJoinEventRequest(int memberId)
        {
            var member = await _db.Users.FirstOrDefaultAsync(m => m.Id == memberId);

            if (member == null)
            {
                return BadRequest("id does not exist");
            }

            var eMember = await _db.EventMembers.FirstOrDefaultAsync(m => m.UserID == memberId);

            if (eMember == null || eMember.Status != Status.Pending.ToString())
            {
                return BadRequest("id does not exist or its not pending");
            }

            eMember.Status = Status.Rejected.ToString();

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("KickEventMember/{memberId}")]
        public async Task<IActionResult> KickEventMember(int memberId)
        {
            var member = await _db.Users.FirstOrDefaultAsync(m => m.Id == memberId);

            if (member == null)
            {
                return BadRequest("id does not exist");
            }

            var eMember = await _db.EventMembers.FirstOrDefaultAsync(m => m.UserID == memberId);

            if (eMember == null || eMember.Status != Status.Accepted.ToString())
            {
                return BadRequest("id does not exist or its not Accepted");
            }

            _db.EventMembers.Remove(eMember);

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("Dashboard")]
        public async Task<IActionResult> GetDashboardData(int clubLeaderId)
        {
            // Check if club exists for this leader
            var club = await _db.Clubs
                .FirstOrDefaultAsync(c => c.ClubLeaderID == clubLeaderId);

            if (club == null)
            {
                var noClubDashboard = new LeaderClubDashboardDTO
                {
                    ClubName = "",
                    ClubStatus = "no_club",
                    TotalMembers = 0,
                    PendingRequests = 0,
                    TotalEvents = 0,
                    PendingEvents = 0
                };
                return Ok(noClubDashboard);
            }

            var pendingClubMembersCount = await _db.ClubMembers
                .CountAsync(cm => cm.Club.ClubLeaderID == clubLeaderId && cm.Status == Status.Pending.ToString());

            var acceptedClubMembersCount = await _db.ClubMembers
                .CountAsync(cm => cm.Club.ClubLeaderID == clubLeaderId && cm.Status == Status.Accepted.ToString());

            var totalClubMembersCount = await _db.ClubMembers
                .CountAsync(cm => cm.Club.ClubLeaderID == clubLeaderId);
                
            var pendingEventMembersCount = await _db.EventMembers
                .CountAsync(em => em.Event.Club.ClubLeaderID == clubLeaderId && em.Status == Status.Pending.ToString());                

            var acceptedEventMembersCount = await _db.EventMembers
                .CountAsync(em => em.Event.Club.ClubLeaderID == clubLeaderId && em.Status == Status.Accepted.ToString());                

            var acceptedEventsCount = await _db.Events
                .CountAsync(e => e.Club.ClubLeaderID == clubLeaderId && e.Status == Status.Accepted.ToString());
                
            var pendingEventsCount = await _db.Events
                .CountAsync(e => e.Club.ClubLeaderID == clubLeaderId && e.Status == Status.Pending.ToString());

            var dashboardData = new LeaderClubDashboardDTO
            {
                ClubName = club.ClubName,
                ClubStatus = club.Status,
                TotalMembers = totalClubMembersCount,
                PendingRequests = pendingClubMembersCount,
                TotalEvents = acceptedEventsCount,
                PendingEvents = pendingEventsCount
            };

            return Ok(dashboardData);
        }
    }
}
