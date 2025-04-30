import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../core/services/dashboard.service';

interface DashboardStats {
  totalDatabases: number;
  activeDatabases: number;
  errorDatabases: number;
  totalBackups: number;
  pendingBackups: number;
  failedBackups: number;
  totalUsers: number;
  activeUsers: number;
}

interface ActivityLog {
  id: number;
  timestamp: string;
  userId: number;
  username: string;
  action: string;
  details: string;
  databaseId?: number;
  databaseName?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone : false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalDatabases: 0,
    activeDatabases: 0,
    errorDatabases: 0,
    totalBackups: 0,
    pendingBackups: 0,
    failedBackups: 0,
    totalUsers: 0,
    activeUsers: 0
  };

  recentActivities: ActivityLog[] = [];
  loading = true;
  error = '';

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: data => {
        this.stats = data;
        this.loading = false;
      },
      error: err => {
        this.error = 'Erreur lors du chargement des données: ' + err.message;
        this.loading = false;
      }
    });

    this.dashboardService.getRecentActivities().subscribe({
      next: data => {
        this.recentActivities = data;
      },
      error: err => {
        console.error('Erreur lors du chargement des activités récentes', err);
      }
    });
  }

  getActivityIcon(action: string): string {
    switch (action) {
      case 'LOGIN':
        return 'login';
      case 'LOGOUT':
        return 'logout';
      case 'START_BACKUP':
        return 'backup';
      case 'COMPLETE_BACKUP':
        return 'check_circle';
      case 'FAILED_BACKUP':
        return 'error';
      case 'ADD_DATABASE':
        return 'add_circle';
      case 'MODIFY_DATABASE':
        return 'edit';
      case 'DELETE_DATABASE':
        return 'delete';
      default:
        return 'info';
    }
  }

  getActivityIconClass(action: string): string {
    switch (action) {
      case 'FAILED_BACKUP':
      case 'DELETE_DATABASE':
        return 'error-icon';
      case 'COMPLETE_BACKUP':
        return 'success-icon';
      case 'START_BACKUP':
      case 'ADD_DATABASE':
        return 'info-icon';
      default:
        return '';
    }
  }
}
