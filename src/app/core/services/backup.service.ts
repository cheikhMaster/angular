// src/app/core/services/backup.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private apiUrl = `${environment.apiUrl}/backups`;

  constructor(private http: HttpClient) { }

  getAllBackups(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getBackupById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getBackupsByDatabaseId(databaseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/database/${databaseId}`);
  }

  initiateBackup(backupData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/initiate`, backupData);
  }

  cancelBackup(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/cancel`, {});
  }

  deleteBackup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getDatabasesByType(type: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?type=${type}`);
  }

}
