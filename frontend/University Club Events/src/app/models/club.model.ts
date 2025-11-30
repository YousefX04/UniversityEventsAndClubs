export enum ClubCategory {
  TECHNOLOGY = 'technology',
  ARTS = 'arts',
  SPORTS = 'sports',
  ACADEMIC = 'academic',
  CULTURAL = 'cultural',
  SOCIAL = 'social'
}

export enum ClubStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

export interface Club {
  id: number;
  name: string;
  description: string;
  category: ClubCategory;
  established: string;
  leader: string;
  viceLeader?: string;
  members: number;
  events: number;
  meetingDay?: string;
  meetingTime?: string;
  meetingLocation?: string;
  contact: {
    email: string;
    phone: string;
    telegram?: string;
  };
  goals?: string[];
  activities?: string[];
  instruments?: string[];
  equipment?: string[];
  sports?: string[];
  skills?: string[];
  status: ClubStatus;
}

export interface JoinRequest {
  id: number;
  studentName: string;
  studentId: string;
  major: string;
  year: string;
  clubName: string;
  motivation: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ClubCreationRequest {
  id: number;
  name: string;
  description: string;
  category: ClubCategory;
  leader: string;
  expectedMembers: number;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

