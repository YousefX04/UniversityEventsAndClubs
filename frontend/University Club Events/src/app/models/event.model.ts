export enum EventCategory {
  TECHNOLOGY = 'technology',
  WORKSHOP = 'workshop',
  SPORTS = 'sports',
  CULTURAL = 'cultural',
  ACADEMIC = 'academic',
  MUSIC = 'music'
}

export enum EventType {
  CONFERENCE = 'conference',
  WORKSHOP = 'workshop',
  TOURNAMENT = 'tournament',
  FESTIVAL = 'festival',
  CONCERT = 'concert'
}

export enum EventStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  duration?: string;
  location: string;
  category: EventCategory;
  type: EventType;
  club: string;
  organizer: string;
  registered: number;
  capacity: number;
  price: number;
  status: EventStatus;
  speakers?: Array<{ name: string; title: string }>;
  agenda?: Array<{ time: string; activity: string }>;
  requirements?: string[];
  materials?: string[];
  prizes?: string[];
  rules?: string[];
  performances?: string[];
  food?: string[];
  topics?: string[];
  prerequisites?: string[];
  performers?: string[];
  instruments?: string[];
  requestDate?: string;
}

export interface EventRegistration {
  id: number;
  eventId: number;
  userId: number;
  registrationDate: string;
  status: 'registered' | 'attended' | 'cancelled';
}

