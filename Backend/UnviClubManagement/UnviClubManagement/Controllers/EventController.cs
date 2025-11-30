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

            var updatedEvent = new EventUpdate
            {
                Id = model.EventID,
                OldName = _event.EventName,
                NewName = model.EventName,
                OldDescription = _event.Description,
                NewDescription = model.Desc,
                OldStart = _event.StartAt,
                NewStart = model.StartAt,
                OldEnd = _event.EndAt,
                NewEnd = model.EndAt,               
            };

            await _db.EventUpdates.AddAsync(updatedEvent);

            await _db.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("GetAllEvents")]
        public async Task<IActionResult> GetAllEvents(int? clubId, int? clubLeaderId)
        {
            IQueryable<Event> query = _db.Events.Include(e => e.Club);

            // If clubId is provided, show events for that club (only approved)
            if (clubId.HasValue)
            {
                query = query.Where(e => e.Status.ToLower() == "approved" && e.ClubID == clubId);
            }
            // If clubLeaderId is provided, show both approved events and pending events for that club
            else if (clubLeaderId.HasValue)
            {
                // First, get the club ID for this club leader
                var club = await _db.Clubs.FirstOrDefaultAsync(c => c.ClubLeaderID == clubLeaderId);
                if (club != null)
                {
                    query = query.Where(e => e.Status.ToLower() == "approved" || 
                                           (e.Status.ToLower() == "pending" && e.ClubID == club.Id));
                }
                else
                {
                    // If club leader has no club, only show approved events
                    query = query.Where(e => e.Status.ToLower() == "approved");
                }
            }
            // Otherwise, show all approved events
            else
            {
                query = query.Where(e => e.Status.ToLower() == "approved");
            }

            var events = await query
                .Select(e => new {
                    e.Id,
                    e.EventName,
                    e.Description,
                    e.Club.ClubName,
                    e.StartAt,
                    e.EndAt,
                    Status = e.Status.ToLower()
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