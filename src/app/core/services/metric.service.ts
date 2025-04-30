// src/app/core/services/metric.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetricService {
  private apiUrl = `${environment.apiUrl}/metrics`;

  constructor(private http: HttpClient) { }

  getMetricsByDatabaseAndType(databaseId: number, type: string, startDate: Date, endDate: Date): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/database/${databaseId}/type/${type}/date-range`, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  }

  getLatestMetricByDatabaseAndType(databaseId: number, type: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/database/${databaseId}/type/${type}/latest`);
  }
}
