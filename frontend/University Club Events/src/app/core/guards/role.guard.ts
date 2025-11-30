import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { UserRole } from "../../models/user.model";

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getCurrentUser();
  const allowedRoles = route.data?.["roles"] as UserRole[];

  // If user is not authenticated, redirect to login
  if (!user) {
    router.navigate(["/login"], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // If no roles are specified, allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // Check if user has the required role
  if (allowedRoles.includes(user.role)) {
    return true;
  }

  // Redirect to appropriate dashboard based on user role
  switch (user.role) {
    case UserRole.STUDENT:
      router.navigate(["/student-dashboard"]);
      break;
    case UserRole.LEADER:
      router.navigate(["/leader-dashboard"]);
      break;
    case UserRole.ADMIN:
      router.navigate(["/admin-dashboard"]);
      break;
    default:
      router.navigate(["/"]);
  }

  return false;
};
