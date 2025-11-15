using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UnviClubManagement.Data;
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

            var eMember = await _db.ClubMembers.FirstOrDefaultAsync(m => m.UserID == memberId);

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
    }
}
