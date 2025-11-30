export enum UserRole {
  STUDENT = "student",
  LEADER = "leader",
  ADMIN = "admin",
}

// User model for the application
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  major?: string;
  year?: string;
  studentId?: string;
  club?: string;
  position?: string;
  department?: string;
  joinedClubs?: string[];
  registeredEvents?: string[];
  points?: number;
  clubMembers?: number;
  eventsCreated?: number;
  totalAttendees?: number;
  totalEvents?: number;
  totalClubs?: number;
  pendingRequests?: number;
}

// Request model for the Login API
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Response model for the Login API
export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}

// Request model for the Register API
export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  phone: string;
  roleName: string;
}

export const normalizeUserRole = (
  role?: string | UserRole | null
): UserRole | null => {
  const value = (role ?? "").toString().toLowerCase();
  switch (value) {
    case "student":
      return UserRole.STUDENT;
    case "leader":
    case "clubleader":
    case "manager":
      return UserRole.LEADER;
    case "admin":
    case "administrator":
      return UserRole.ADMIN;
    default:
      return null;
  }
};
