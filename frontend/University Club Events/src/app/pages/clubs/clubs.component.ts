import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClubService } from '../../core/services/club.service';
import { AuthService } from '../../core/services/auth.service';
import { Club, ClubCategory } from '../../models/club.model';

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './clubs.component.html',
  styleUrl: './clubs.component.css'
})
export class ClubsComponent implements OnInit {
  private clubService = inject(ClubService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  clubs: Club[] = [];
  filteredClubs: Club[] = [];
  loading = true;
  searchTerm = '';
  selectedCategory: ClubCategory | '' = '';
  sortBy: 'popular' | 'newest' | 'members' = 'popular';

  categories = Object.values(ClubCategory);
  showJoinModal = false;
  selectedClub: Club | null = null;
  joinRequest = {
    studentName: '',
    studentId: '',
    major: '',
    year: '',
    motivation: ''
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] || '';
      this.loadClubs();
    });
  }

  loadClubs(): void {
    this.loading = true;
    this.clubService.getClubs({
      search: this.searchTerm || undefined,
      sortBy: this.sortBy
    }).subscribe({
      next: (clubs) => {
        this.clubs = clubs;
        this.filteredClubs = clubs;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading clubs:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.clubs];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(c => c.category === this.selectedCategory);
    }

    this.filteredClubs = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.loadClubs();
  }

  openJoinModal(club: Club): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/clubs' } });
      return;
    }

    this.selectedClub = club;
    this.showJoinModal = true;
    const user = this.authService.getCurrentUser();
    if (user) {
      this.joinRequest.studentName = user.name;
      this.joinRequest.studentId = user.studentId || '';
      this.joinRequest.major = user.major || '';
      this.joinRequest.year = user.year || '';
    }
  }

  closeJoinModal(): void {
    this.showJoinModal = false;
    this.selectedClub = null;
    this.joinRequest = {
      studentName: '',
      studentId: '',
      major: '',
      year: '',
      motivation: ''
    };
  }

  submitJoinRequest(): void {
    if (!this.selectedClub) return;

    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      alert('لم يتم العثور على معلومات المستخدم');
      return;
    }

    // Prepare request data
    const requestData = {
      studentName: this.joinRequest.studentName,
      studentId: this.joinRequest.studentId,
      major: this.joinRequest.major,
      year: this.joinRequest.year,
      motivation: this.joinRequest.motivation
    };

    this.clubService.requestJoinClub(this.selectedClub.id, user.id, requestData).subscribe({
      next: () => {
        alert('تم إرسال طلب الانضمام بنجاح! سيتم مراجعته من قبل قائد النادي.');
        this.closeJoinModal();
      },
      error: (error) => {
        console.error('Error joining club:', error);
        if (error.status === 500) {
          alert('حدث خطأ في الخادم أثناء محاولة الانضمام للنادي. الرجاء المحاولة مرة أخرى لاحقاً.');
        } else if (error.status === 409) {
          alert('لقد قمت بالفعل بإرسال طلب انضمام لهذا النادي.');
        } else {
          alert(error.error?.message || 'فشل إرسال طلب الانضمام');
        }
      }
    });
  }
}

