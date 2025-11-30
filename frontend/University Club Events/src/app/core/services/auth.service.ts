import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, BehaviorSubject, map, tap, catchError, throwError } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  normalizeUserRole,
  UserRole,
} from "../../models/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.authApiUrl || `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  // Main service - HTTP calls to the Login API
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const formData = new FormData();
    formData.append("Email", credentials.email);
    formData.append("Password", credentials.password);

    return this.http.post<any>(`${this.apiUrl}/login`, formData).pipe(
      map((response: any) => {
        const payload = response?.user ?? response;
        if (!payload) {
          throw new Error("لم يتم استلام بيانات المستخدم من الخادم.");
        }

        const normalizedUser: User = {
          id: payload.id ?? payload.Id ?? 0,
          name: payload.name ?? payload.userName ?? "",
          email: payload.email ?? credentials.email,
          role:
            normalizeUserRole(payload.role ?? payload.roleName) ??
            UserRole.STUDENT,
        };

        // Extract token - try multiple possible locations
        const token =
          response?.token ??
          response?.accessToken ??
          response?.Token ??
          "mock-token-" + Date.now();

        const normalizedResponse: LoginResponse = {
          user: normalizedUser,
          token: token,
          expiresIn: response?.expiresIn ?? 0,
        };

        this.setUser(normalizedUser, normalizedResponse.token);
        return normalizedResponse;
      }),
      catchError(this.handleError)
    );
  }

  // Main service - HTTP calls to the Register API
  register(payload: RegisterRequest): Observable<User> {
    const formData = new FormData();
    formData.append("UserName", payload.userName);
    formData.append("Email", payload.email);
    formData.append("Password", payload.password);
    formData.append("Phone", payload.phone);
    formData.append("RoleName", payload.roleName);

    return this.http.post<User>(`${this.apiUrl}/register`, formData)
      .pipe(catchError(this.handleError));
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  private setUser(rawUser: User, token: string): void {
    const normalizedRole =
      normalizeUserRole((rawUser as any)?.role) ??
      normalizeUserRole((rawUser as any)?.roleName) ??
      UserRole.STUDENT;

    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...rawUser,
        role: normalizedRole,
      })
    );
    this.currentUserSubject.next({
      ...rawUser,
      role: normalizedRole,
    });
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem("user");
    if (!userStr || userStr === "undefined") {
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const normalizedRole =
        normalizeUserRole(user?.role) ?? normalizeUserRole(user?.roleName);

      const normalizedUser: User = {
        ...user,
        role: normalizedRole ?? user?.role,
      };

      this.currentUserSubject.next(normalizedUser);
    } catch (error) {
      console.warn("Failed to parse user from storage, clearing token.", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      this.currentUserSubject.next(null);
    }
  }

  refreshToken(): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/refresh`, {
        token: this.getToken(),
      })
      .pipe(
        tap((response: LoginResponse) => {
          this.setUser(response.user, response.token);
        }),
        catchError(this.handleError)
      );
  }

  // Get the appropriate dashboard route based on user role
  getDashboardRoute(role?: UserRole): string {
    const userRole = role ?? this.getCurrentUser()?.role;

    switch (userRole) {
      case UserRole.STUDENT:
        return "/student-dashboard";
      case UserRole.LEADER:
        return "/leader-dashboard";
      case UserRole.ADMIN:
        return "/admin-dashboard";
      default:
        return "/";
    }
  }

  // Change password
  changePassword(
    currentPassword: string,
    newPassword: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append("CurrentPassword", currentPassword);
    formData.append("NewPassword", newPassword);

    // Common endpoint patterns - try ChangePassword (PascalCase)
    return this.http.post(`${this.apiUrl}/ChangePassword`, formData)
      .pipe(catchError(this.handleError));
  }

  // Update user profile
  updateProfile(profileData: any): Observable<User> {
    const formData = new FormData();
    Object.keys(profileData).forEach((key) => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(
          key.charAt(0).toUpperCase() + key.slice(1),
          profileData[key]
        );
      }
    });

    return this.http.put<any>(`${this.apiUrl}/update-profile`, formData).pipe(
      tap((response: any) => {
        const updatedUser = response?.user ?? response;
        if (updatedUser) {
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            const merged = { ...currentUser, ...updatedUser };
            this.currentUserSubject.next(merged);
            localStorage.setItem("user", JSON.stringify(merged));
          }
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      // Handle specific HTTP error codes
      switch (error.status) {
        case 401:
          errorMessage = 'Invalid credentials. Please check your email and password.';
          break;
        case 403:
          errorMessage = 'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 409:
          errorMessage = 'User already exists. Please try a different email.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
      }
    }
    return throwError(() => errorMessage);
  }
}