import { Component, OnInit, inject, HostBinding } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Router, ActivatedRoute, RouterModule } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
})
export class LoginComponent implements OnInit {
  @HostBinding('class') class = 'login-page';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm!: FormGroup;
  showPassword = false;
  loading = false;
  error = "";

  ngOnInit(): void {
    // If user is already logged in, redirect to their dashboard
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && this.authService.isAuthenticated()) {
      const dashboardRoute = this.authService.getDashboardRoute(
        currentUser.role
      );
      this.router.navigate([dashboardRoute]);
      return;
    }

    // Initialize the form group with error handling
    try {
      this.loginForm = this.fb.group({
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required]],
        rememberMe: [false],
      });
    } catch (error) {
      console.error('Error initializing login form:', error);
      // Initialize with default values if form builder fails
      this.loginForm = new FormGroup({});
      this.loginForm.addControl('email', this.fb.control("", [Validators.required, Validators.email]));
      this.loginForm.addControl('password', this.fb.control("", [Validators.required]));
      this.loginForm.addControl('rememberMe', this.fb.control(false));
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = "";

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;

        // Small delay to ensure auth state is fully updated
        setTimeout(() => {
          // Get return URL from query params or use role-specific dashboard
          const returnUrl = this.route.snapshot.queryParams["returnUrl"];

          if (returnUrl) {
            // Navigate to the return URL
            this.router.navigateByUrl(returnUrl);
          } else {
            // Navigate to role-specific dashboard
            const dashboardRoute = this.authService.getDashboardRoute(
              response.user.role
            );
            this.router.navigate([dashboardRoute]);
          }
        }, 100);
      },
      error: (error) => {
        this.loading = false;
        this.error =
          error.error?.message || "فشل تسجيل الدخول. يرجى التحقق من بياناتك.";
      },
    });
  }
}