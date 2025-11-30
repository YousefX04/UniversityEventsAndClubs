import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AttendanceService, AttendanceRecord } from '../../core/services/attendance.service';
import { EventService } from '../../core/services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
})
export class AttendanceComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private eventService = inject(EventService);
  private route = inject(ActivatedRoute);

  event: Event | null = null;
  attendanceRecords: AttendanceRecord[] = [];
  loading = true;

  stats = {
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    attendanceRate: 0
  };

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    if (eventId) {
      this.loadEvent(+eventId);
      this.loadAttendance(+eventId);
    }
  }

  loadEvent(id: number): void {
    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.event = event;
      },
      error: (error) => {
        console.error('Error loading event:', error);
      }
    });
  }

  loadAttendance(eventId: number): void {
    this.loading = true;
    this.attendanceService.getEventAttendance(eventId).subscribe({
      next: (records) => {
        this.attendanceRecords = records;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading attendance:', error);
        this.loading = false;
      }
    });

    this.attendanceService.getAttendanceStats(eventId).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.attendanceRecords.length;
    this.stats.present = this.attendanceRecords.filter(r => r.status === 'present').length;
    this.stats.absent = this.attendanceRecords.filter(r => r.status === 'absent').length;
    this.stats.late = this.attendanceRecords.filter(r => r.status === 'late').length;
    this.stats.attendanceRate = this.stats.total > 0 
      ? (this.stats.present / this.stats.total) * 100 
      : 0;
  }

  markAttendance(record: AttendanceRecord, status: 'present' | 'absent' | 'late'): void {
    if (!this.event) return;
    
    this.attendanceService.markAttendance(this.event.id, record.userId, status).subscribe({
      next: (updated) => {
        record.status = updated.status;
        this.calculateStats();
      },
      error: (error) => {
        alert(error.error?.message || 'فشل تحديث الحضور');
      }
    });
  }

  exportAttendance(format: 'csv' | 'excel' = 'csv'): void {
    if (!this.event) return;
    
    this.attendanceService.exportAttendance(this.event.id, format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${this.event?.id}.${format === 'csv' ? 'csv' : 'xlsx'}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        alert(error.error?.message || 'فشل تصدير البيانات');
      }
    });
  }
}

