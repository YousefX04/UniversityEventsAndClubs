import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../../core/services/event.service';
import { ClubService } from '../../core/services/club.service';
import { AuthService } from '../../core/services/auth.service';
import { Event } from '../../models/event.model';
import { Club } from '../../models/club.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private eventService = inject(EventService);
  private clubService = inject(ClubService);
  private authService = inject(AuthService);

  currentUser: User | null = null;
  registeredEvents: Event[] = [];
  myClubs: Club[] = [];
  upcomingEvents: Event[] = [];
  managedEvents: Event[] = [];
  loading = true;

  stats = {
    clubs: 0,
    events: 0,
    pending: 0,
    points: 0
  };

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Load user's registered events
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      this.eventService.getUserRegisteredEvents().subscribe({
        next: (events) => {
          this.registeredEvents = events;
          this.stats.events = events.length;
        },
        error: (error) => {
          console.error('Error loading registered events:', error);
          this.registeredEvents = [];
        }
      });
    }

    // Load upcoming events for all users
    this.eventService.getEvents({ status: 'approved' as any }).subscribe({
      next: (events) => {
        this.managedEvents = events;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.managedEvents = [];
        this.loading = false;
      }
    });

    // Load user's clubs
    this.clubService.getUserClubs().subscribe({
      next: (clubs) => {
        this.myClubs = clubs;
        this.stats.clubs = clubs.length;
      },
      error: (error) => {
        console.error('Error loading user clubs:', error);
        this.myClubs = [];
      }
    });

    // Load upcoming events for sidebar
    this.eventService.getEvents({ status: 'approved' as any }).subscribe({
      next: (events) => {
        // Filter to only show upcoming events
        const now = new Date();
        this.upcomingEvents = events
          .filter(e => new Date(e.date + 'T' + e.time) > now)
          .slice(0, 3); // Show only next 3 events
      },
      error: (error) => {
        console.error('Error loading upcoming events:', error);
        this.upcomingEvents = [];
      }
    });

    if (this.currentUser) {
      this.stats.points = this.currentUser.points || 0;
    }
  }

  registerForEvent(event: Event): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      alert('لم يتم العثور على معلومات المستخدم');
      return;
    }

    this.eventService.registerForEvent(event.id, currentUser.id).subscribe({
      next: () => {
        event.registered++;
        alert(`تم تسجيلك في "${event.title}" بنجاح!`);
        this.loadData();
      },
      error: (error) => {
        console.error('Error registering for event:', error);
        if (error.status === 500) {
          alert('حدث خطأ في الخادم أثناء محاولة التسجيل في الحدث. الرجاء المحاولة مرة أخرى لاحقاً.');
        } else {
          alert(error.error?.message || 'فشل التسجيل في الحدث');
        }
      }
    });
  }
}