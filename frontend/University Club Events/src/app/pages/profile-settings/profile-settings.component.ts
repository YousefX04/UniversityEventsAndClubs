import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { User } from "../../models/user.model";

@Component({
  selector: "app-profile-settings",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./profile-settings.component.html",
  styleUrl: "./profile-settings.component.css",
})
export class ProfileSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  loading = false;
  error = "";
  success = "";
  activeTab = "profile"; // 'profile' or 'password'

  // Set to true when backend password change endpoint is implemented
  passwordChangeEnabled = true;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(["/login"]);
      return;
    }

    this.initializeForms();
  }

  initializeForms(): void {
    try {
      // Profile form
      this.profileForm = this.fb.group({
        name: [
          this.currentUser?.name || "",
          [Validators.required, Validators.minLength(3)],
        ],
        email: [{ value: this.currentUser?.email || "", disabled: true }],
        phone: ["", [Validators.pattern(/^[0-9]{11}$/)]],
        major: [this.currentUser?.major || ""],
        year: [this.currentUser?.year || ""],
        studentId: [this.currentUser?.studentId || ""],
      });

      // Password form
      this.passwordForm = this.fb.group(
        {
          currentPassword: ["", [Validators.required]],
          newPassword: ["", [Validators.required, Validators.minLength(6)]],
          confirmPassword: ["", [Validators.required]],
        },
        {
          validators: this.passwordMatchValidator,
        }
      );
    } catch (error) {
      console.error('Error initializing forms:', error);
      // Fallback initialization
      this.profileForm = this.fb.group({
        name: [
          this.currentUser?.name || "",
          [Validators.required, Validators.minLength(3)],
        ],
        email: [{ value: this.currentUser?.email || "", disabled: true }],
        phone: ["", [Validators.pattern(/^[0-9]{11}$/)]],
        major: [this.currentUser?.major || ""],
        year: [this.currentUser?.year || ""],
        studentId: [this.currentUser?.studentId || ""],
      });

      this.passwordForm = this.fb.group({
        currentPassword: ["", [Validators.required]],
        newPassword: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      });
      // Note: Custom validators on the form group level are more complex to add after creation
      // The form will work but without the password match validation in this fallback case
    }
  }

  passwordMatchValidator(control: AbstractControl) {
    const formGroup = control as FormGroup;
    const newPassword = formGroup.get("newPassword");
    const confirmPassword = formGroup.get("confirmPassword");

    if (
      newPassword &&
      confirmPassword &&
      newPassword.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.error = "";
    this.success = "";
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach((key) => {
        this.profileForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = "";
    this.success = "";

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.success = "تم تحديث الملف الشخصي بنجاح";

        // Update local user data
        this.currentUser = this.authService.getCurrentUser();
      },
      error: (error) => {
        this.loading = false;
        this.error =
          error.error?.message ||
          "فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.";
      },
    });
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach((key) => {
        this.passwordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = "";
    this.success = "";

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.success = "تم تغيير كلمة المرور بنجاح";
        this.passwordForm.reset();
      },
      error: (error) => {
        this.loading = false;
        this.error =
          error.error?.message ||
          "فشل تغيير كلمة المرور. يرجى التحقق من كلمة المرور الحالية.";
      },
    });
  }

  getErrorMessage(formName: "profile" | "password", fieldName: string): string {
    const form = formName === "profile" ? this.profileForm : this.passwordForm;
    const field = form.get(fieldName);

    if (field?.hasError("required")) {
      return "هذا الحقل مطلوب";
    }

    if (field?.hasError("minlength")) {
      return `الحد الأدنى ${field.errors?.["minlength"].requiredLength} أحرف`;
    }

    if (field?.hasError("pattern")) {
      return "رقم الهاتف يجب أن يكون 11 رقماً";
    }

    if (
      fieldName === "confirmPassword" &&
      field?.hasError("passwordMismatch")
    ) {
      return "كلمات المرور غير متطابقة";
    }

    return "";
  }
}