import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { AuthService } from '../../core/services/auth.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css'
})
export class EventDetailComponent implements OnInit {
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  event: Event | null = null;
  loading = true;
  isRegistered = false;

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEvent(+eventId);
    }
  }

  loadEvent(id: number): void {
    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.loading = false;
      }
    });
  }

  registerForEvent(): void {
    if (!this.event) return;
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/events/${this.event.id}` } });
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      alert('لم يتم العثور على معلومات المستخدم');
      return;
    }

    this.eventService.registerForEvent(this.event.id, currentUser.id).subscribe({
      next: () => {
        if (this.event) {
          this.event.registered++;
          this.isRegistered = true;
          alert(`تم تسجيلك في "${this.event.title}" بنجاح!`);
        }
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

