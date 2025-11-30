import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import {
  Event,
  EventRegistration,
  EventCategory,
  EventStatus,
  EventType,
} from "../../models/event.model";

@Injectable({
  providedIn: "root",
})
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Event`;
  private adminApiUrl = `${environment.apiUrl}/Admin`;

  getEvents(filters?: {
    category?: EventCategory;
    club?: string;
    status?: EventStatus;
    search?: string;
    clubId?: number;
    showAll?: boolean; // Add showAll parameter
    clubLeaderId?: number; // Add clubLeaderId parameter
  }): Observable<Event[]> {
    let params = new HttpParams();
    if (filters?.category) {
      params = params.set("category", filters.category);
    }
    if (filters?.club) {
      params = params.set("club", filters.club);
    }
    if (filters?.status) {
      params = params.set("status", filters.status);
    }
    if (filters?.search) {
      params = params.set("search", filters.search);
    }
    if (filters?.clubId) {
      params = params.set("clubId", filters.clubId.toString());
    }
    // Add showAll parameter
    if (filters?.showAll !== undefined) {
      params = params.set("showAll", filters.showAll.toString());
    }
    // Add clubLeaderId parameter
    if (filters?.clubLeaderId !== undefined) {
      params = params.set("clubLeaderId", filters.clubLeaderId.toString());
    }
    return this.http.get<any[]>(`${this.apiUrl}/GetAllEvents`, { params }).pipe(
      map((events: any[]) => events.map((event: any) => ({
        id: event.id,
        title: event.eventName,
        description: event.description,
        date: event.startAt ? new Date(event.startAt).toISOString().split('T')[0] : '',
        time: event.startAt ? new Date(event.startAt).toISOString().split('T')[1].substring(0, 5) : '',
        location: '', // API doesn't provide location
        category: EventCategory.TECHNOLOGY, // Default category
        type: EventType.CONFERENCE, // Default type
        club: event.clubName || '', // Use clubName from API
        organizer: '', // API doesn't provide organizer
        registered: 0, // API doesn't provide registered count
        capacity: 0, // API doesn't provide capacity
        price: 0, // API doesn't provide price
        status: event.status || EventStatus.PENDING
      }))),
      catchError(this.handleError)
    );
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((event: any) => {
        // Handle null or undefined response
        if (!event) {
          return {
            id: 0,
            title: '',
            description: '',
            date: '',
            time: '',
            location: '',
            category: EventCategory.TECHNOLOGY,
            type: EventType.CONFERENCE,
            club: '',
            organizer: '',
            registered: 0,
            capacity: 0,
            price: 0,
            status: EventStatus.PENDING
          };
        }

        // Handle normal response
        return {
          id: event.id || 0,
          title: event.title || '',
          description: event.description || '',
          date: event.date || '',
          time: event.time || '',
          location: event.location || '',
          category: event.category || EventCategory.TECHNOLOGY,
          type: event.type || EventType.CONFERENCE,
          club: event.club || '',
          organizer: event.organizer || '',
          registered: event.registered || 0,
          capacity: event.capacity || 0,
          price: event.price || 0,
          status: event.status || EventStatus.PENDING
        };
      }),
      catchError(this.handleError)
    );
  }

  createEvent(eventData: {
    EventName: string;
    Desc: string;
    CreatedAt?: string;
    StartAt?: string;
    EndAt?: string;
    ClubID: number;
  }): Observable<Event> {
    // According to API spec: POST /api/Event with multipart/form-data
    const formData = new FormData();
    formData.append('EventName', eventData.EventName);
    formData.append('Desc', eventData.Desc);
    formData.append('CreatedAt', eventData.CreatedAt || new Date().toISOString());
    formData.append('StartAt', eventData.StartAt || new Date().toISOString());
    formData.append('EndAt', eventData.EndAt || new Date().toISOString());
    formData.append('ClubID', eventData.ClubID.toString());

    return this.http.post<any>(this.apiUrl, formData).pipe(
      map((event: any) => {
        // Handle null or undefined response
        if (!event) {
          return {
            id: 0,
            title: eventData.EventName,
            description: eventData.Desc,
            date: new Date().toISOString().split('T')[0],
            time: '00:00',
            location: '',
            category: EventCategory.TECHNOLOGY,
            type: EventType.CONFERENCE,
            club: '',
            organizer: '',
            registered: 0,
            capacity: 0,
            price: 0,
            status: EventStatus.PENDING
          };
        }

        // Handle normal response
        return {
          id: event.id || 0,
          title: event.title || eventData.EventName, // Fix: was using event.eventName
          description: event.description || eventData.Desc, // Fix: was using event.desc
          date: event.date || new Date().toISOString().split('T')[0],
          time: event.time || '00:00',
          location: event.location || '',
          category: event.category || EventCategory.TECHNOLOGY,
          type: event.type || EventType.CONFERENCE,
          club: event.club || '',
          organizer: event.organizer || '',
          registered: event.registered || 0,
          capacity: event.capacity || 0,
          price: event.price || 0,
          status: event.status || EventStatus.PENDING
        };
      }),
      catchError(this.handleError)
    );
  }

  updateEvent(eventData: {
    EventID: number;
    EventName: string;
    Desc: string;
    StartAt?: string;
    EndAt?: string;
  }): Observable<Event> {
    // According to API spec: PUT /api/Event with multipart/form-data
    const formData = new FormData();
    formData.append('EventID', eventData.EventID.toString());
    formData.append('EventName', eventData.EventName);
    formData.append('Desc', eventData.Desc);
    if (eventData.StartAt) {
      formData.append('StartAt', eventData.StartAt);
    }
    if (eventData.EndAt) {
      formData.append('EndAt', eventData.EndAt);
    }

    return this.http.put<any>(this.apiUrl, formData).pipe(
      map((event: any) => {
        // Handle null or undefined response
        if (!event) {
          return {
            id: eventData.EventID,
            title: eventData.EventName,
            description: eventData.Desc,
            date: new Date().toISOString().split('T')[0],
            time: '00:00',
            location: '',
            category: EventCategory.TECHNOLOGY,
            type: EventType.CONFERENCE,
            club: '',
            organizer: '',
            registered: 0,
            capacity: 0,
            price: 0,
            status: EventStatus.PENDING
          };
        }

        // Handle normal response
        return {
          id: event.id || eventData.EventID,
          title: event.title || eventData.EventName,
          description: event.description || eventData.Desc,
          date: event.date || new Date().toISOString().split('T')[0],
          time: event.time || '00:00',
          location: event.location || '',
          category: event.category || EventCategory.TECHNOLOGY,
          type: event.type || EventType.CONFERENCE,
          club: event.club || '',
          organizer: event.organizer || '',
          registered: event.registered || 0,
          capacity: event.capacity || 0,
          price: event.price || 0,
          status: event.status || EventStatus.PENDING
        };
      }),
      catchError(this.handleError)
    );
  }

  deleteEvent(eventid: number): Observable<void> {
    // According to API spec: DELETE /api/Event?eventid={id}
    return this.http.delete<void>(this.apiUrl, {
      params: { eventid: eventid.toString() }
    }).pipe(catchError(this.handleError));
  }

  registerForEvent(eventId: number, studentId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/JoinEvent/${eventId}`,
      {},
      { params: { studentId: studentId.toString() } }
    ).pipe(catchError(this.handleError));
  }

  cancelRegistration(eventId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventId}/register`)
      .pipe(catchError(this.handleError));
  }

  getEventRegistrations(eventId: number): Observable<EventRegistration[]> {
    return this.http.get<EventRegistration[]>(
      `${this.apiUrl}/${eventId}/registrations`
    ).pipe(catchError(this.handleError));
  }

  getUserRegisteredEvents(): Observable<Event[]> {
    // Using the JoinEvent endpoint to get user registered events
    // This might need to be adjusted based on actual API implementation
    return this.http.get<Event[]>(`${this.apiUrl}/GetAllEvents`)
      .pipe(catchError(this.handleError));
  }

  approveEvent(eventId: number): Observable<any> {
    // Use Admin API endpoint to accept event request
    return this.http.put(`${this.adminApiUrl}/AcceptEventRequest`, null, {
      params: { eventId: eventId.toString() },
    }).pipe(catchError(this.handleError));
  }

  rejectEvent(eventId: number, reason?: string): Observable<any> {
    // Use Admin API endpoint to reject event request
    return this.http.put(`${this.adminApiUrl}/RejectEventRequest`, null, {
      params: { eventId: eventId.toString() },
    }).pipe(catchError(this.handleError));
  }

  getPendingEvents(): Observable<Event[]> {
    // Use Admin API endpoint for pending events
    return this.http.get<Event[]>(`${this.adminApiUrl}/PendingEvents`)
      .pipe(catchError(this.handleError));
  }

  getAdminDashboardStats(): Observable<any> {
    // Get admin dashboard statistics
    return this.http.get(`${this.adminApiUrl}/Dashboard`)
      .pipe(catchError(this.handleError));
  }

  // Get events by club ID
  getEventsByClubId(clubId: number): Observable<Event[]> {
    // According to API spec: GET /api/Event/GetAllEvents?clubId={clubId}
    let params = new HttpParams();
    params = params.set("clubId", clubId.toString());

    return this.http.get<any[]>(`${this.apiUrl}/GetAllEvents`, { params }).pipe(
      map((events: any[]) => events.map((event: any) => ({
        id: event.id,
        title: event.eventName,
        description: event.description,
        date: event.startAt ? new Date(event.startAt).toISOString().split('T')[0] : '',
        time: event.startAt ? new Date(event.startAt).toISOString().split('T')[1].substring(0, 5) : '',
        location: '', // API doesn't provide location
        category: EventCategory.TECHNOLOGY, // Default category
        type: EventType.CONFERENCE, // Default type
        club: event.clubName || '', // Use clubName from API
        organizer: '', // API doesn't provide organizer
        registered: 0, // API doesn't provide registered count
        capacity: 0, // API doesn't provide capacity
        price: 0, // API doesn't provide price
        status: event.status || EventStatus.PENDING
      }))),
      catchError(this.handleError)
    );
  }

  // Join an event
  joinEvent(eventId: number, studentId: number): Observable<any> {
    // According to API spec: POST /api/Event/JoinEvent/{eventId}?studentId={studentId}
    return this.http.post<any>(
      `${this.apiUrl}/JoinEvent/${eventId}`,
      null,
      { params: { studentId: studentId.toString() } }
    ).pipe(catchError(this.handleError));
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
        case 400:
          errorMessage = 'Bad request. Please check your input data.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in to continue.';
          break;
        case 403:
          errorMessage = 'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Event not found.';
          break;
        case 409:
          errorMessage = 'Conflict. This event may already exist.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
      }
    }
    return throwError(() => errorMessage);
  }
}