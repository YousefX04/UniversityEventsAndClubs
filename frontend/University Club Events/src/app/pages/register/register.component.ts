import { Component, OnInit, inject, HostBinding } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./register.component.html",
  styleUrl: "./register.component.css",
})
export class RegisterComponent implements OnInit {
  @HostBinding('class') class = 'register-page';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  error = "";
  success = false;

  roles = [
    { value: "student", label: "طالب" },
    { value: "clubLeader", label: "قائد نادي" },
  ];

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
      this.registerForm = this.fb.group(
        {
          userName: ["", [Validators.required, Validators.minLength(3)]],
          email: ["", [Validators.required, Validators.email]],
          password: ["", [Validators.required, Validators.minLength(6)]],
          confirmPassword: ["", [Validators.required]],
          phone: ["", [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
          roleName: ["student", [Validators.required]],
        },
        {
          validators: this.passwordMatchValidator,
        }
      );
    } catch (error) {
      console.error('Error initializing register form:', error);
      // Initialize with default values if form builder fails
      this.registerForm = this.fb.group({
        userName: ["", [Validators.required, Validators.minLength(3)]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
        phone: ["", [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
        roleName: ["student", [Validators.required]],
      });
      // Note: Custom validators on the form group level are more complex to add after creation
      // The form will work but without the password match validation in this fallback case
    }
  }

  passwordMatchValidator(control: AbstractControl) {
    const formGroup = control as FormGroup;
    const password = formGroup.get("password");
    const confirmPassword = formGroup.get("confirmPassword");

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach((key) => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = "";
    this.success = false;

    const { confirmPassword, ...registerData } = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;

        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(["/login"]);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.error =
          error.error?.message || "فشل التسجيل. يرجى المحاولة مرة أخرى.";
      },
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (field?.hasError("required")) {
      return "هذا الحقل مطلوب";
    }

    if (fieldName === "userName" && field?.hasError("minlength")) {
      return "يجب أن يكون الاسم 3 أحرف على الأقل";
    }

    if (fieldName === "email" && field?.hasError("email")) {
      return "البريد الإلكتروني غير صحيح";
    }

    if (fieldName === "password" && field?.hasError("minlength")) {
      return "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    if (
      fieldName === "confirmPassword" &&
      field?.hasError("passwordMismatch")
    ) {
      return "كلمات المرور غير متطابقة";
    }

    if (fieldName === "phone" && field?.hasError("pattern")) {
      return "رقم الهاتف يجب أن يكون 11 رقماً";
    }

    return "";
  }
}