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
    public class EventController : ControllerBase
    {
        private readonly AppDbContext _db;

        public EventController(AppDbContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> AddEvent([FromForm] EventDTO model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var eventName = await _db.Events.FirstOrDefaultAsync(e => e.EventName == model.EventName);

            if (eventName != null)
            {
                return BadRequest("Name Already Exist");
            }

            var newEvent = new Event()
            {
                ClubID = model.ClubID,
                EventName = model.EventName,
                Description = model.Desc,
                StartAt = model.StartAt,
                EndAt = model.EndAt,
                Status = Status.Pending.ToString()
            };

            await _db.Events.AddAsync(newEvent);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteEvent(int eventid)
        {
            var _event = await _db.Events.FirstOrDefaultAsync(e => e.Id == eventid);

            if (_event == null)
            {
                return BadRequest("id does not exist");
            }

            await _db.EventMembers
                .Where(em => em.EventID == eventid)
                .ExecuteDeleteAsync();


            _db.Events.Remove(_event);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpPut]
        public async Task<IActionResult> UpdateEvent([FromForm] UpdateEventDTO model)
        {
            var _event = await _db.Events
                .FirstOrDefaultAsync(e => e.Id == model.EventID);

            if (_event == null)
            {
                return BadRequest("EventID Does not exist");
            }

            var eventName = await _db.Events
                .FirstOrDefaultAsync(e => e.EventName == model.EventName);

            if (eventName != null)
            {
                return BadRequest("Name Already Exist");
            }

            _event.EventName = model.EventName;
            _event.Description = model.Desc;

            await _db.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("GetAllEvents")]
        public async Task<IActionResult> GetAllEvents(int clubId)
        {
            var events = await _db.Events
                .Include(e => e.Club)
                .Where(e => e.Status == Status.Accepted.ToString() && e.ClubID == clubId)
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

        [HttpPost("JoinEvent/{eventId}")]
        public async Task<IActionResult> JoinClub(int studentId, int eventId)
        {
            await _db.EventMembers.AddAsync(new EventMember
            {
                EventID = eventId,
                UserID = studentId,
                Status = Status.Pending.ToString()
            });

            await _db.SaveChangesAsync();

            return Ok();
        }
    }
}