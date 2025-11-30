import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { roleGuard } from "./core/guards/role.guard";
import { UserRole } from "./models/user.model";

export const routes: Routes = [
  // Public routes
  {
    path: "",
    redirectTo: "/login",
    pathMatch: "full"
  },
  {
    path: "home",
    loadComponent: () =>
      import("./pages/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "login",
    loadComponent: () =>
      import("./pages/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./pages/register/register.component").then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: "events",
    loadComponent: () =>
      import("./pages/events/events.component").then((m) => m.EventsComponent),
  },
  {
    path: "events/:id",
    loadComponent: () =>
      import("./pages/event-detail/event-detail.component").then(
        (m) => m.EventDetailComponent
      ),
  },
  {
    path: "clubs",
    loadComponent: () =>
      import("./pages/clubs/clubs.component").then((m) => m.ClubsComponent),
  },
  {
    path: "clubs/:id",
    loadComponent: () =>
      import("./pages/club-detail/club-detail.component").then(
        (m) => m.ClubDetailComponent
      ),
  },

  // Profile Settings - Protected route
  {
    path: "profile-settings",
    loadComponent: () =>
      import("./pages/profile-settings/profile-settings.component").then(
        (m) => m.ProfileSettingsComponent
      ),
    canActivate: [authGuard],
  },

  // Student routes - Only accessible by students
  {
    path: "student-dashboard",
    loadComponent: () =>
      import("./pages/student-dashboard/student-dashboard.component").then(
        (m) => m.StudentDashboardComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.STUDENT] },
  },

  // Leader routes - Only accessible by club leaders
  {
    path: "leader-dashboard",
    loadComponent: () =>
      import("./pages/leader-dashboard/leader-dashboard.component").then(
        (m) => m.LeaderDashboardComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.LEADER] },
  },

  // Admin routes - Only accessible by administrators
  {
    path: "admin-dashboard",
    loadComponent: () =>
      import("./pages/admin-dashboard/admin-dashboard.component").then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN] },
  },

  // Shared routes for Leaders and Admins
  {
    path: "attendance/:eventId",
    loadComponent: () =>
      import("./pages/attendance/attendance.component").then(
        (m) => m.AttendanceComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.LEADER, UserRole.ADMIN] },
  },

  // Fallback route for 404
  {
    path: "**",
    loadComponent: () =>
      import("./pages/not-found/not-found.component").then(
        (m) => m.NotFoundComponent
      ),
  },
];