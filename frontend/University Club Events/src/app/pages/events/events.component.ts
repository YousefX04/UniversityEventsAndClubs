import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../core/services/event.service';
import { AuthService } from '../../core/services/auth.service';
import { Event, EventCategory, EventStatus } from '../../models/event.model';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent implements OnInit {
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  events: Event[] = [];
  filteredEvents: Event[] = [];
  loading = true;
  searchTerm = '';
  selectedCategory: EventCategory | '' = '';
  selectedClub = '';
  selectedType = '';

  categories = Object.values(EventCategory);
  clubs: string[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] || '';
      this.loadEvents();
    });
  }

  loadEvents(): void {
    this.loading = true;

    // Check if current user is admin
    const currentUser = this.authService.getCurrentUser();
    const isAdmin = currentUser?.role === UserRole.ADMIN;

    // If admin, load all events (showAll = true)
    // If not admin, load only approved events (showAll = false)
    const filters = isAdmin ?
      { showAll: true, search: this.searchTerm || undefined } :
      { status: EventStatus.APPROVED, search: this.searchTerm || undefined };

    this.eventService.getEvents(filters).subscribe({
      next: (events) => {
        this.events = events;
        this.filteredEvents = events;
        this.extractClubs();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.loading = false;
      }
    });
  }

  extractClubs(): void {
    this.clubs = [...new Set(this.events.map(e => e.club))];
  }

  applyFilters(): void {
    let filtered = [...this.events];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term)
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(e => e.category === this.selectedCategory);
    }

    if (this.selectedClub) {
      filtered = filtered.filter(e => e.club === this.selectedClub);
    }

    this.filteredEvents = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  registerForEvent(event: Event): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/events' } });
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      alert('لم يتم العثور على معلومات المستخدم');
      return;
    }

    this.eventService.registerForEvent(event.id, currentUser.id).subscribe({
      next: () => {
        event.registered++;
        alert(`تم تسجيلك في "${event.title}" بنجاح!`);
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

  isRegistered(event: Event): boolean {
    // This would check if current user is registered
    // For now, return false
    return false;
  }
}

