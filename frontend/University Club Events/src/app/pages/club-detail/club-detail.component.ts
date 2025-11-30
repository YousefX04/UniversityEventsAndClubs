import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ClubService } from '../../core/services/club.service';
import { AuthService } from '../../core/services/auth.service';
import { Club } from '../../models/club.model';

@Component({
  selector: 'app-club-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './club-detail.component.html',
  styleUrl: './club-detail.component.css'
})
export class ClubDetailComponent implements OnInit {
  private clubService = inject(ClubService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  club: Club | null = null;
  loading = true;

  ngOnInit(): void {
    const clubId = this.route.snapshot.paramMap.get('id');
    if (clubId) {
      this.loadClub(+clubId);
    }
  }

  loadClub(id: number): void {
    this.clubService.getClubById(id).subscribe({
      next: (club) => {
        this.club = club;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading club:', error);
        this.loading = false;
      }
    });
  }
}

