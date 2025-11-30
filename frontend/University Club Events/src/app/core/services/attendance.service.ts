import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AttendanceRecord {
  id: number;
  eventId: number;
  userId: number;
  userName: string;
  studentId: string;
  status: 'present' | 'absent' | 'late';
  checkInTime?: string;
  notes?: string;
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/attendance`;

  getEventAttendance(eventId: number): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.apiUrl}/event/${eventId}`)
      .pipe(catchError(this.handleError));
  }

  markAttendance(eventId: number, userId: number, status: 'present' | 'absent' | 'late', notes?: string): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(`${this.apiUrl}/mark`, {
      eventId,
      userId,
      status,
      notes
    }).pipe(catchError(this.handleError));
  }

  updateAttendance(attendanceId: number, status: 'present' | 'absent' | 'late', notes?: string): Observable<AttendanceRecord> {
    return this.http.put<AttendanceRecord>(`${this.apiUrl}/${attendanceId}`, {
      status,
      notes
    }).pipe(catchError(this.handleError));
  }

  getAttendanceStats(eventId: number): Observable<AttendanceStats> {
    return this.http.get<AttendanceStats>(`${this.apiUrl}/stats/${eventId}`)
      .pipe(catchError(this.handleError));
  }

  exportAttendance(eventId: number, format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${eventId}?format=${format}`, {
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
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
          errorMessage = 'Attendance record not found.';
          break;
        case 409:
          errorMessage = 'Conflict. Attendance may already be recorded.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
      }
    }
    return throwError(() => errorMessage);
  }
}