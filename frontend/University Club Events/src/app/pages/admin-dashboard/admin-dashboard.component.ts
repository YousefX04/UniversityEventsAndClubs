import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { EventService } from "../../core/services/event.service";
import { ClubService } from "../../core/services/club.service";
import { AuthService } from "../../core/services/auth.service";
import { Event } from "../../models/event.model";
import { ClubCreationRequest } from "../../models/club.model";
import { User } from "../../models/user.model";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./admin-dashboard.component.html",
  styleUrl: "./admin-dashboard.component.css",
})
export class AdminDashboardComponent implements OnInit {
  private eventService = inject(EventService);
  private clubService = inject(ClubService);
  private authService = inject(AuthService);

  currentUser: User | null = null;
  pendingEvents: Event[] = [];
  clubRequests: ClubCreationRequest[] = [];
  allClubs: any[] = []; // All clubs from API
  pendingClubEdits: any[] = []; // Pending club edit requests
  loading = true;
  showEditClubModal = false;
  
  editClub = {
    ClubID: 0,
    ClubName: '',
    Desc: ''
  };

  stats = {
    totalEvents: 0,
    totalClubs: 0,
    pendingEvents: 0,
    pendingClubs: 0,
  };

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Load admin dashboard stats
    this.eventService.getAdminDashboardStats().subscribe({
      next: (stats) => {
        console.log('Admin Dashboard Stats:', stats);
        // Map the correct field names from the API response
        this.stats.totalEvents = (stats.numOfAcceptedEvents || 0) + (stats.numOfPendingEvents || 0);
        this.stats.totalClubs = (stats.numOfAcceptedClubs || 0) + (stats.numOfPendingClubs || 0);
        this.stats.pendingEvents = stats.numOfPendingEvents || 0;
        this.stats.pendingClubs = stats.numOfPendingClubs || 0;
      },
      error: (error) => {
        console.error("Error loading dashboard stats:", error);
      },
    });

    // Load pending events
    this.eventService.getPendingEvents().subscribe({
      next: (events) => {
        this.pendingEvents = events;
        // Don't override stats.pendingEvents here - it comes from dashboard stats
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading pending events:", error);
        this.loading = false;
      },
    });

    // Load club creation requests
    this.clubService.getClubCreationRequests().subscribe({
      next: (requests) => {
        this.clubRequests = requests;
        // Don't override stats.pendingClubs here - it comes from dashboard stats
      },
      error: (error) => {
        console.error("Error loading club requests:", error);
      },
    });

    // Load all clubs for management section
    this.clubService.getClubs().subscribe({
      next: (response: any) => {
        console.log('All Clubs API Response:', response);
        
        // Handle both array and object responses
        let clubsArray: any[] = [];
        if (Array.isArray(response)) {
          clubsArray = response;
        } else if (response && typeof response === 'object') {
          clubsArray = [response];
        }
        
        console.log('Processed clubs array:', clubsArray);
        
        // Map the API response to the format expected by the template
        this.allClubs = clubsArray.map(club => ({
          id: club.id,
          clubName: club.clubName || club.name || '',
          description: club.description || club.Desc || '',
          userName: club.userName || club.leader || ''
        }));
        
        console.log('Mapped clubs for display:', this.allClubs);
      },
      error: (error) => {
        console.error("Error loading clubs:", error);
      },
    });

    // TODO: Load pending club edit requests when API is available
    // For now, we'll use mock data to show the UI structure
    this.pendingClubEdits = [
      // Example structure - will be replaced with real API data
      /*
      {
        id: 1,
        clubId: 1,
        clubName: 'Alahly',
        currentName: 'Alahly',
        newName: 'Al Ahly New',
        currentDescription: 'Old description',
        newDescription: 'New description',
        requestedBy: 'Club Leader Name',
        requestedDate: new Date().toISOString()
      }
      */
    ];
  }

  approveEvent(event: Event): void {
    if (confirm("هل أنت متأكد من الموافقة على هذا الحدث؟")) {
      this.eventService.approveEvent(event.id).subscribe({
        next: () => {
          this.loadData();
          alert("تم الموافقة على الحدث بنجاح");
        },
        error: (error) => {
          console.error("Error approving event:", error);
          alert(error.error?.message || "فشل الموافقة على الحدث");
        },
      });
    }
  }

  rejectEvent(event: Event): void {
    if (confirm("هل أنت متأكد من رفض هذا الحدث؟")) {
      this.eventService.rejectEvent(event.id).subscribe({
        next: () => {
          this.loadData();
          alert("تم رفض الحدث");
        },
        error: (error) => {
          console.error("Error rejecting event:", error);
          alert(error.error?.message || "فشل رفض الحدث");
        },
      });
    }
  }

  approveClubRequest(request: ClubCreationRequest): void {
    // Use the club ID from the request
    const clubId = request.id;

    if (confirm("هل أنت متأكد من الموافقة على إنشاء هذا النادي؟")) {
      this.clubService.approveClubCreation(clubId).subscribe({
        next: () => {
          this.loadData();
          alert("تم الموافقة على إنشاء النادي بنجاح");
        },
        error: (error) => {
          console.error("Error approving club:", error);
          alert(error.error?.message || "فشل الموافقة على إنشاء النادي");
        },
      });
    }
  }

  rejectClubRequest(request: ClubCreationRequest): void {
    const clubId = request.id;

    if (confirm("هل أنت متأكد من رفض طلب إنشاء هذا النادي؟")) {
      this.clubService.rejectClubCreation(clubId).subscribe({
        next: () => {
          this.loadData();
          alert("تم رفض طلب إنشاء النادي");
        },
        error: (error) => {
          console.error("Error rejecting club:", error);
          alert(error.error?.message || "فشل رفض الطلب");
        },
      });
    }
  }

  openEditClubModal(club: any): void {
    this.editClub = {
      ClubID: club.id,
      ClubName: club.clubName,
      Desc: club.description
    };
    this.showEditClubModal = true;
  }

  closeEditClubModal(): void {
    this.showEditClubModal = false;
    this.editClub = {
      ClubID: 0,
      ClubName: '',
      Desc: ''
    };
  }

  updateClub(): void {
    if (!this.editClub.ClubName || !this.editClub.Desc) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    // Admin can directly update clubs without approval
    this.clubService.updateClub(this.editClub).subscribe({
      next: () => {
        alert('تم تحديث النادي بنجاح');
        this.closeEditClubModal();
        this.loadData();
      },
      error: (error) => {
        console.error('Error updating club:', error);
        // Show detailed error message
        if (error.error && error.error.errors) {
          let errorMessage = 'فشل تحديث النادي:\n';
          Object.keys(error.error.errors).forEach(key => {
            errorMessage += `${key}: ${error.error.errors[key].join(', ')}\n`;
          });
          alert(errorMessage);
        } else {
          alert(error.error?.message || 'فشل تحديث النادي');
        }
      }
    });
  }

  deleteClub(club: any): void {
    if (confirm(`هل أنت متأكد من حذف النادي "${club.clubName}"؟`)) {
      this.clubService.deleteClub(club.id).subscribe({
        next: () => {
          alert('تم حذف النادي بنجاح');
          this.loadData();
        },
        error: (error) => {
          console.error('Error deleting club:', error);
          alert(error.error?.message || 'فشل حذف النادي');
        }
      });
    }
  }

  approveClubEdit(edit: any): void {
    // TODO: Implement when API is available
    alert('وظيفة الموافقة على تعديل النادي غير متاحة حالياً. يرجى تزويدنا بنقطة نهاية API للموافقة على طلبات التعديل.');
  }

  rejectClubEdit(edit: any): void {
    // TODO: Implement when API is available
    alert('وظيفة رفض تعديل النادي غير متاحة حالياً. يرجى تزويدنا بنقطة نهاية API لرفض طلبات التعديل.');
  }
}
