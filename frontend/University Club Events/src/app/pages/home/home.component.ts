import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { ClubService } from '../../core/services/club.service';
import { Event } from '../../models/event.model';
import { Club } from '../../models/club.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private eventService = inject(EventService);
  private clubService = inject(ClubService);

  featuredEvents: Event[] = [];
  popularClubs: Club[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadFeaturedEvents();
    this.loadPopularClubs();
  }

  loadFeaturedEvents(): void {
    this.eventService.getEvents({ status: 'approved' as any }).subscribe({
      next: (events) => {
        this.featuredEvents = events.slice(0, 3);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.loading = false;
      }
    });
  }

  loadPopularClubs(): void {
    this.clubService.getClubs({ sortBy: 'popular' }).subscribe({
      next: (clubs) => {
        this.popularClubs = clubs.slice(0, 3);
      },
      error: (error) => {
        console.error('Error loading clubs:', error);
      }
    });
  }
}

