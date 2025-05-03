// src/app/core/services/database.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private apiUrl = `${environment.apiUrl}/databases`;

  constructor(private http: HttpClient) { }

  getAllDatabases(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getDatabaseById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }


  createDatabase(database: any): Observable<any> {
    console.log('Données envoyées au serveur:', JSON.stringify(database));
    // Si nécessaire, forcez la valeur à être un boolean
    if (database.isLocal !== undefined) {
      database.isLocal = Boolean(database.isLocal);
    }
    return this.http.post<any>(`${this.apiUrl}`, database);
  }

  updateDatabase(id: number, database: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, database);
  }

  updateDatabaseStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteDatabase(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getDatabasesByType(type: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?type=${type}`);
  }
  // Dans database.service.ts
testConnection(connectionData: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/databases/test-connection`, connectionData);
}

}
