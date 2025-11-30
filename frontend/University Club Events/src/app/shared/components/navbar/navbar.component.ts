import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { User, UserRole } from "../../../models/user.model";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.css",
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  currentUser: User | null = null;
  isAuthenticated = false;
  dashboardRoute = "/";
  UserRole = UserRole; // Expose enum to template

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      // Update dashboard route based on user role
      if (user) {
        this.dashboardRoute = this.authService.getDashboardRoute(user.role);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }

  isActiveRoute(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + "/");
  }

  onSearch(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const searchInput = form.querySelector(
      'input[name="search"]'
    ) as HTMLInputElement;
    if (searchInput && searchInput.value.trim()) {
      this.router.navigate(["/events"], {
        queryParams: { search: searchInput.value.trim() },
      });
    }
  }
}
