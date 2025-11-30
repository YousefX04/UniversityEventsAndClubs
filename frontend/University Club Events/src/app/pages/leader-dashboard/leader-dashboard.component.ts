import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../core/services/event.service';
import { ClubService } from '../../core/services/club.service';
import { AuthService } from '../../core/services/auth.service';
import { Event } from '../../models/event.model';
import { Club, JoinRequest, ClubCategory, ClubStatus } from '../../models/club.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-leader-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './leader-dashboard.component.html',
  styleUrls: ['./leader-dashboard.component.css']
})
export class LeaderDashboardComponent implements OnInit {

  private eventService = inject(EventService);
  private clubService = inject(ClubService);
  private authService = inject(AuthService);

  currentUser: User | null = null;
  myClub: Club | null = null;
  myEvents: Event[] = [];
  joinRequests: JoinRequest[] = [];
  loading = true;

  showCreateClubModal = false;
  showEditClubModal = false;
  showCreateEventModal = false;

  newClub = { ClubName: '', Desc: '' };
  editClub = { ClubID: 0, ClubName: '', Desc: '' };
  newEvent = { EventName: '', Desc: '', StartAt: '', EndAt: '' };

  stats = { members: 0, events: 0, attendees: 0, pendingRequests: 0 };

  trackByEventId(index: number, event: Event): number {
    return event.id;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadData();
  }

  /********************************************
  
  * LOAD DASHBOARD DATA
    ********************************************/
  loadData(): void {
    this.loading = true;

    if (!this.currentUser?.id) {
      this.loading = false;
      return;
    }

    this.clubService.getLeaderDashboard(this.currentUser.id).subscribe({
      next: (dashboardData: any) => {
        console.log("Dashboard Data:", dashboardData);

        // Update stats with the new DTO structure
        this.stats.members = dashboardData.totalMembers || 0;
        this.stats.events = dashboardData.totalEvents || 0;
        this.stats.pendingRequests = dashboardData.pendingRequests || 0;

        if (dashboardData.clubStatus === "no_club") {
          this.myClub = null;
          this.loading = false;
          return;
        }

        // Set club data from dashboard
        this.myClub = {
          id: 0, // Will be set when we load club details
          name: dashboardData.clubName || "",
          description: "",
          category: ClubCategory.TECHNOLOGY,
          established: "",
          leader: this.currentUser?.name || "",
          members: this.stats.members,
          events: this.stats.events,
          contact: { email: "", phone: "" },
          status: ClubStatus.ACTIVE
        };

        // Load full club details
        this.loadClubDetails();
      },
      error: (error) => {
        console.error('Dashboard Error:', error);
        this.loading = false;
      }
    });

  }

  /********************************************
  
  * LOAD CLUB DETAILS
    ********************************************/
  loadClubDetails(): void {
    // For club leaders, we need to get the club by the leader ID, not club ID
    if (!this.currentUser?.id) {
      console.error("No user ID available to load club details");
      this.loading = false;
      return;
    }

    // Get club by leader ID
    this.clubService.getClubById(this.currentUser.id).subscribe({
      next: (club: any) => {
        // Make sure club data exists before updating
        if (club && club.id > 0) {
          // Extract values safely
          const clubId = club?.id || 0;
          const clubName = club?.clubName || club?.name || "";
          const clubDescription = club?.description || club?.Desc || "";
          const clubEstablished = club?.createdAt || club?.established || "";
          const clubCategory = club?.category || ClubCategory.TECHNOLOGY;
          const clubLeader = club?.userName || club?.leader || "";
          // Count members from the members array
          const clubMembers = club?.members ? club.members.length : 0;
          const clubEvents = club?.events || 0;
          const clubContact = club?.contact || { email: "", phone: "" };
          const clubStatus = club?.status || ClubStatus.ACTIVE;

          this.myClub = {
            id: clubId,
            name: clubName,
            description: clubDescription,
            established: clubEstablished,
            category: clubCategory,
            leader: clubLeader,
            members: clubMembers,
            events: clubEvents,
            contact: clubContact,
            status: clubStatus
          } as Club;
        }

        this.loadJoinRequests();
        this.loadClubMembers();
        this.loadEvents();
        this.loading = false;
      },
      error: (err) => {
        console.error("Club details load error:", err);
        this.loading = false;
      }
    });
  }

  /********************************************
  
  * LOAD JOIN REQUESTS
    ********************************************/
  loadJoinRequests(): void {
    if (!this.currentUser?.id) return;

    this.clubService.getLeaderJoinRequests(this.currentUser.id).subscribe({
      next: (requests: any[]) => {
        // Transform the backend response to match the JoinRequest interface
        // Backend returns: [{ id: 3, userName: "Mohamed" }]
        this.joinRequests = requests.map(request => ({
          id: request.id || request.Id || 0,
          studentName: request.userName || request.UserName || '',
          studentId: '', // Not provided by backend
          major: '', // Not provided by backend
          year: '', // Not provided by backend
          clubName: this.myClub?.name || '', // Use current club name
          motivation: '', // Not provided by backend
          requestDate: '', // Not provided by backend
          status: 'pending' // All returned requests are pending
        }));
        this.stats.pendingRequests = this.joinRequests.length;
      },
      error: () => {
        this.joinRequests = [];
      }
    });
  }

  /********************************************
  
  * LOAD CLUB MEMBERS
    ********************************************/
  loadClubMembers(): void {
    // We're already getting member count from the club details, so we don't need to make another API call
    // The member count is already set in loadClubDetails method
    if (this.myClub) {
      this.stats.members = this.myClub.members;
    }
  }

  /********************************************
  
  * LOAD EVENTS
    ********************************************/
  loadEvents(): void {
    if (!this.myClub?.id || !this.currentUser?.id) return;

    // Use clubLeaderId parameter to get both approved and pending events for this club leader
    this.eventService.getEvents({ clubLeaderId: this.currentUser.id }).subscribe({
      next: (events) => {
        this.myEvents = events;
        this.stats.events = events.length;
      },
      error: (err) => {
        console.error("Error loading events:", err);
      }
    });

  }

  /********************************************
  
  * JOIN REQUEST ACTIONS
    ********************************************/
  approveJoinRequest(request: JoinRequest): void {
    if (!confirm(`هل أنت متأكد من الموافقة على انضمام ${request.studentName}؟`)) return;


    this.clubService.acceptJoinRequest(request.id).subscribe({

      next: () => {
        alert('تمت الموافقة بنجاح');
        this.loadData();
      },
      error: (error) => {
        alert(error.error?.message || "خطأ الموافقة");
      }
    });

  }

  rejectJoinRequest(request: JoinRequest): void {
    if (!confirm(`هل أنت متأكد من رفض طلب ${request.studentName}؟`)) return;

    this.clubService.rejectJoinRequest(request.id).subscribe({
      next: () => {
        alert('تم الرفض بنجاح');
        this.loadData();
      },
      error: (error) => {
        alert(error.error?.message || "خطأ الرفض");
      }
    });

  }

  /********************************************
  
  * CREATE CLUB
    ********************************************/
  openCreateClubModal(): void {
    this.showCreateClubModal = true;
    this.newClub = { ClubName: "", Desc: "" };
  }

  closeCreateClubModal(): void {
    this.showCreateClubModal = false;
  }

  createClub(): void {
    if (!this.currentUser?.id) {
      alert("User not found");
      return;
    }

    const clubData = {
      ClubName: this.newClub.ClubName,
      Desc: this.newClub.Desc,
      ClubLeaderID: this.currentUser.id
    };

    this.clubService.createClub(clubData).subscribe({
      next: () => {
        alert("تم إرسال طلب إنشاء النادي للمراجعة");
        this.closeCreateClubModal();
        this.loadData();
      },
      error: (err) => {
        alert(err.error?.message || "خطأ الإنشاء");
      }
    });

  }

  /********************************************
  
  * EDIT CLUB
    ********************************************/
  openEditClubModal(): void {
    // Check if myClub exists and has a valid ID
    if (!this.myClub || this.myClub.id <= 0) return;

    this.editClub = {
      ClubID: this.myClub.id,
      ClubName: this.myClub.name,
      Desc: this.myClub.description
    };

    this.showEditClubModal = true;
  }

  closeEditClubModal(): void {
    this.showEditClubModal = false;
  }

  updateClub(): void {
    alert("Requests to update club info must be reviewed by admin (future feature).");
    this.closeEditClubModal();
  }

  /********************************************
  
  * CREATE EVENT
    ********************************************/
  openCreateEventModal(): void {
    this.showCreateEventModal = true;


    const now = new Date();

    const later = new Date(now.getTime() + 3600000);

    this.newEvent = {
      EventName: "",
      Desc: "",
      StartAt: now.toISOString().slice(0, 16),
      EndAt: later.toISOString().slice(0, 16)
    };


  }

  closeCreateEventModal(): void {
    this.showCreateEventModal = false;
  }

  createEvent(): void {
    // Check if myClub exists and has a valid ID
    if (!this.myClub || this.myClub.id <= 0) {
      alert("لا يمكنك إنشاء حدث بدون نادي");
      return;
    }

    const eventData = {
      EventName: this.newEvent.EventName,
      Desc: this.newEvent.Desc,
      StartAt: this.newEvent.StartAt,
      EndAt: this.newEvent.EndAt,
      ClubID: this.myClub.id
    };

    this.eventService.createEvent(eventData).subscribe({
      next: (event) => {
        alert(`تم إنشاء الحدث "${event.title}" بنجاح`);
        this.closeCreateEventModal();
        this.loadEvents();
      },
      error: (error) => {
        alert(error.error?.message || "خطأ إنشاء الحدث");
      }
    });
  }
}
