import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricService } from '../../../core/services/metric.service';
import { DatabaseService } from '../../../core/services/database.service';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-metrics-dashboard',
  standalone: false,
  templateUrl: './metrics-dashboard.component.html',
  styleUrls: ['./metrics-dashboard.component.scss']
})
export class MetricsDashboardComponent implements OnInit, OnDestroy {
  databases: any[] = [];
  selectedDatabase: any;
  selectedMetricType = 'CONNECTIONS';

  stats = {
    connections: { current: 0, max: 0, percentage: 0 },
    tablespace: { used: 0, total: 0, percentage: 0 },
    io: { reads: 0, writes: 0, total: 0 },
    memory: { used: 0, total: 0, percentage: 0 },
    performance: { hitRatio: 0, slowQueries: 0, longQueries: 0 }
  };

  alerts: any[] = [];
  loading = false;
  error = '';

  private destroy$ = new Subject<void>();
  private refreshInterval = 30000; // 30 secondes

  constructor(
    private metricService: MetricService,
    private databaseService: DatabaseService
  ) { }

  ngOnInit(): void {
    this.loadDatabases();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDatabases(): void {
    this.databaseService.getAllDatabases().subscribe({
      next: (data) => {
        this.databases = data.filter(db => db.status === 'ACTIVE');
        if (this.databases.length > 0) {
          this.selectedDatabase = this.databases[0];
          this.loadAllMetrics();
        }
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des bases de données';
      }
    });
  }

  onDatabaseChange(): void {
    this.loadAllMetrics();
  }

  loadAllMetrics(): void {
    if (!this.selectedDatabase) {
      return;
    }

    this.loading = true;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 1); // Dernière heure

    // Charger les métriques de connexion
    this.loadConnectionMetrics();
    // Charger les métriques de tablespace
    this.loadTablespaceMetrics();
    // Charger les métriques d'E/S
    this.loadIOMetrics();
    // Charger les métriques de mémoire
    this.loadMemoryMetrics();
    // Charger les métriques de performance
    this.loadPerformanceMetrics();
    // Charger les alertes
    this.loadAlerts();

    this.loading = false;
  }

  loadConnectionMetrics(): void {
    this.metricService.getLatestMetricByDatabaseAndType(
      this.selectedDatabase.id,
      'CONNECTIONS'
    ).subscribe({
      next: (data) => {
        if (data) {
          this.stats.connections.current = data.metricValue;
          // Calculer le pourcentage basé sur une valeur max estimée
          this.stats.connections.max = 150; // Valeur configurable
          this.stats.connections.percentage = (data.metricValue / this.stats.connections.max) * 100;
        }
      }
    });
  }

  loadTablespaceMetrics(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 1);

    this.metricService.getMetricsByDatabaseAndType(
      this.selectedDatabase.id,
      'TABLESPACE',
      startDate,
      endDate
    ).subscribe({
      next: (data) => {
        let totalUsed = 0;
        let totalSpace = 0;

        data.forEach(metric => {
          if (metric.metricName.includes('Usage')) {
            this.stats.tablespace.percentage = Math.max(this.stats.tablespace.percentage, metric.metricValue);
          } else if (metric.metricName.includes('Size')) {
            totalUsed += metric.metricValue;
          }
        });

        this.stats.tablespace.used = totalUsed;
        this.stats.tablespace.total = totalUsed / (this.stats.tablespace.percentage / 100);
      }
    });
  }

  loadIOMetrics(): void {
    this.metricService.getLatestMetricByDatabaseAndType(
      this.selectedDatabase.id,
      'IO_OPERATIONS'
    ).subscribe({
      next: (data) => {
        if (data) {
          if (data.metricName.includes('Reads')) {
            this.stats.io.reads = data.metricValue;
          } else if (data.metricName.includes('Writes')) {
            this.stats.io.writes = data.metricValue;
          }
          this.stats.io.total = this.stats.io.reads + this.stats.io.writes;
        }
      }
    });
  }

  loadMemoryMetrics(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 1);

    this.metricService.getMetricsByDatabaseAndType(
      this.selectedDatabase.id,
      'MEMORY_USAGE',
      startDate,
      endDate
    ).subscribe({
      next: (data) => {
        let totalMemory = 0;

        data.forEach(metric => {
          totalMemory += metric.metricValue;
        });

        this.stats.memory.used = totalMemory;
        this.stats.memory.total = totalMemory * 1.2; // Estimation
        this.stats.memory.percentage = (this.stats.memory.used / this.stats.memory.total) * 100;
      }
    });
  }

  loadPerformanceMetrics(): void {
    this.metricService.getLatestMetricByDatabaseAndType(
      this.selectedDatabase.id,
      'QUERY_PERFORMANCE'
    ).subscribe({
      next: (data) => {
        if (data) {
          if (data.metricName.includes('Hit Ratio')) {
            this.stats.performance.hitRatio = data.metricValue;
          } else if (data.metricName.includes('Slow Queries')) {
            this.stats.performance.slowQueries = data.metricValue;
          } else if (data.metricName.includes('Long Running Queries')) {
            this.stats.performance.longQueries = data.metricValue;
          }
        }
      }
    });
  }

  loadAlerts(): void {
    // Simuler des alertes basées sur les métriques
    this.alerts = [];

    if (this.stats.connections.percentage > 80) {
      this.alerts.push({
        type: 'warning',
        message: 'Connexions élevées',
        value: `${this.stats.connections.current} / ${this.stats.connections.max}`,
        timestamp: new Date()
      });
    }

    if (this.stats.tablespace.percentage > 85) {
      this.alerts.push({
        type: 'critical',
        message: 'Espace disque faible',
        value: `${this.stats.tablespace.percentage.toFixed(2)}%`,
        timestamp: new Date()
      });
    }

    if (this.stats.performance.hitRatio < 70) {
      this.alerts.push({
        type: 'warning',
        message: 'Performance dégradée',
        value: `Hit ratio: ${this.stats.performance.hitRatio.toFixed(2)}%`,
        timestamp: new Date()
      });
    }
  }

  setupAutoRefresh(): void {
    interval(this.refreshInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAllMetrics();
      });
  }

  exportData(): void {
    const data = {
      database: this.selectedDatabase.name,
      timestamp: new Date().toISOString(),
      stats: this.stats,
      alerts: this.alerts
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitoring_${this.selectedDatabase.name}_${new Date().toISOString()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
