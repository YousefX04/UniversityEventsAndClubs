import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import {
  Club,
  JoinRequest,
  ClubCreationRequest,
  ClubCategory,
  ClubStatus,
} from "../../models/club.model";

@Injectable({
  providedIn: "root",
})
export class ClubService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Club`;
  private adminApiUrl = `${environment.apiUrl}/Admin`;
  private clubLeaderApiUrl = `${environment.apiUrl}/ClubLeader`;

  getClubs(filters?: {
    category?: ClubCategory;
    search?: string;
    sortBy?: "popular" | "newest" | "members";
  }): Observable<Club[]> {
    let params = new HttpParams();

    if (filters?.category) {
      params = params.set('category', filters.category);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }

    return this.http.get<Club[]>(`${this.apiUrl}/GetAllClubs`, { params })
      .pipe(catchError(this.handleError));
  }

  getClubById(id: number): Observable<Club> {
    return this.http.get<Club[]>(`${this.apiUrl}/GetClub`, {
      params: { clubleaderid: id.toString() }
    }).pipe(
      map((clubs: Club[]) => {
        // The backend returns an array, but we only need the first club
        if (clubs && clubs.length > 0) {
          return clubs[0];
        }
        // Return a default club object if no club found
        return {
          id: 0,
          name: '',
          description: '',
          category: ClubCategory.TECHNOLOGY,
          established: '',
          leader: '',
          members: 0,
          events: 0,
          contact: { email: '', phone: '' },
          status: ClubStatus.PENDING
        } as Club;
      }),
      catchError(this.handleError)
    );
  }

  createClub(clubData: {
    ClubName: string;
    Desc: string;
    CreatedAt?: string;
    ClubLeaderID: number;
  }): Observable<Club> {
    const formData = new FormData();
    formData.append('ClubName', clubData.ClubName);
    formData.append('Desc', clubData.Desc);
    formData.append('CreatedAt', clubData.CreatedAt || new Date().toISOString());
    formData.append('ClubLeaderID', clubData.ClubLeaderID.toString());

    return this.http.post<Club>(this.apiUrl, formData)
      .pipe(catchError(this.handleError));
  }

  updateClub(clubData: {
    ClubID: number;
    ClubName: string;
    Desc: string;
  }): Observable<Club> {
    const formData = new FormData();
    formData.append('ClubName', clubData.ClubName);
    formData.append('Desc', clubData.Desc);

    // Use the base URL with club ID as parameter, using lowercase 'clubid' to match patterns
    return this.http.put<Club>(this.apiUrl, formData, {
      params: { clubid: clubData.ClubID.toString() }
    }).pipe(catchError(this.handleError));
  }

  deleteClub(id: number): Observable<void> {
    // Use the base URL with ID as parameter, using lowercase 'id' to match patterns
    return this.http.delete<void>(this.apiUrl, {
      params: { id: id.toString() }
    }).pipe(catchError(this.handleError));
  }

  requestJoinClub(clubId: number, studentId: number, requestData?: any): Observable<any> {
    // Simple implementation that matches backend expectations
    return this.http.post<any>(
      `${this.apiUrl}/JoinClub/${clubId}`,
      null, // Send null body
      {
        params: { studentId: studentId.toString() }
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getJoinRequests(clubId?: number): Observable<JoinRequest[]> {
    let params = new HttpParams();
    if (clubId) {
      params = params.set("clubId", clubId.toString());
    }
    return this.http.get<JoinRequest[]>(`${this.apiUrl}/join-requests`, {
      params,
    }).pipe(catchError(this.handleError));
  }

  getUserClubs(): Observable<Club[]> {
    return this.http.get<Club[]>(`${this.apiUrl}/my-clubs`)
      .pipe(catchError(this.handleError));
  }

  requestClubCreation(request: {
    name: string;
    description: string;
    category: ClubCategory;
    leader: string;
    expectedMembers: number;
  }): Observable<ClubCreationRequest> {
    return this.http.post<ClubCreationRequest>(
      `${this.apiUrl}/creation-requests`,
      request
    ).pipe(catchError(this.handleError));
  }

  getClubCreationRequests(): Observable<ClubCreationRequest[]> {
    // Use Admin API endpoint for pending clubs
    return this.http.get<ClubCreationRequest[]>(
      `${this.adminApiUrl}/PendingClubs`
    ).pipe(catchError(this.handleError));
  }

  approveClubCreation(clubId: number): Observable<any> {
    // Use Admin API endpoint to accept club request
    return this.http.put(`${this.adminApiUrl}/AcceptClubRequest`, null, {
      params: { clubId: clubId.toString() },
    }).pipe(catchError(this.handleError));
  }

  rejectClubCreation(clubId: number, reason?: string): Observable<any> {
    // Use Admin API endpoint to reject club request
    return this.http.put(`${this.adminApiUrl}/RejectClubRequest`, null, {
      params: { clubId: clubId.toString() },
    }).pipe(catchError(this.handleError));
  }

  getMyJoinRequests(): Observable<JoinRequest[]> {
    return this.http.get<JoinRequest[]>(`${this.apiUrl}/my-join-requests`)
      .pipe(catchError(this.handleError));
  }

  // Club Leader endpoints
  acceptJoinRequest(memberId: number): Observable<any> {
    return this.http.put(
      `${this.clubLeaderApiUrl}/AcceptJoinClubRequest`,
      null,
      {
        params: { memberId: memberId.toString() }
      }
    ).pipe(catchError(this.handleError));
  }

  rejectJoinRequest(memberId: number): Observable<any> {
    return this.http.put(
      `${this.clubLeaderApiUrl}/RejectJoinClubRequest`,
      null,
      {
        params: { memberId: memberId.toString() }
      }).pipe(catchError(this.handleError));
  }

  getLeaderJoinRequests(clubLeaderId: number): Observable<JoinRequest[]> {
    let params = new HttpParams();
    params = params.set("clubLeaderId", clubLeaderId.toString());
    return this.http.get<JoinRequest[]>(`${this.clubLeaderApiUrl}/PendingJoinClubRequest`, {
      params,
    }).pipe(catchError(this.handleError));
  }

  getClubMembers(clubId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.clubLeaderApiUrl}/Members/${clubId}`)
      .pipe(catchError(this.handleError));
  }

  kickMember(memberId: number): Observable<any> {
    return this.http.delete(
      `${this.clubLeaderApiUrl}/KickClubMember/${memberId}`
    ).pipe(catchError(this.handleError));
  }

  // Club Leader Event Join Request endpoints
  getLeaderEventJoinRequests(clubLeaderId: number): Observable<any[]> {
    let params = new HttpParams();
    params = params.set("clubLeaderId", clubLeaderId.toString());
    return this.http.get<any[]>(`${this.clubLeaderApiUrl}/PendingJoinEventRequest`, {
      params,
    }).pipe(catchError(this.handleError));
  }

  acceptEventJoinRequest(memberId: number): Observable<any> {
    return this.http.put(
      `${this.clubLeaderApiUrl}/AcceptJoinEventRequest`,
      null,
      {
        params: { memberId: memberId.toString() }
      }
    ).pipe(catchError(this.handleError));
  }

  rejectEventJoinRequest(memberId: number): Observable<any> {
    return this.http.put(
      `${this.clubLeaderApiUrl}/RejectJoinEventRequest`,
      null,
      {
        params: { memberId: memberId.toString() }
      }
    ).pipe(catchError(this.handleError));
  }

  // Club Leader Dashboard
  getLeaderDashboard(clubLeaderId: number): Observable<any> {
    return this.http.get(`${this.clubLeaderApiUrl}/Dashboard`, {
      params: { clubLeaderId: clubLeaderId.toString() }
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
          errorMessage = 'Club not found.';
          break;
        case 409:
          errorMessage = 'Conflict. This club may already exist.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
      }
    }
    return throwError(() => errorMessage);
  }
}
