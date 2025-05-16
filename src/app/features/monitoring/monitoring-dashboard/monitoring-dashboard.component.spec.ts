import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricService } from '../../../core/services/metric.service';
import { DatabaseService } from '../../../core/services/database.service';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

Chart.register(...registerables);

@Component({
  selector: 'app-monitoring-dashboard',
  templateUrl: './monitoring-dashboard.component.html',
  styleUrls: ['./monitoring-dashboard.component.scss']
})
export class MonitoringDashboardComponent implements OnInit, OnDestroy {
  databases: any[] = [];
  selectedDatabase: any;
  selectedMetricType: string = 'CONNECTIONS';
  metricTypes = [
    { value: 'CONNECTIONS', label: 'Connexions' },
    { value: 'TABLESPACE', label: 'Espace disque' },
    { value: 'IO_OPERATIONS', label: 'Opérations E/S' },
    { value: 'MEMORY_USAGE', label: 'Utilisation mémoire' },
    { value: 'QUERY_PERFORMANCE', label: 'Performance requêtes' }
  ];

  charts: { [key: string]: Chart } = {};
  metrics: any[] = [];
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

    // Détruire tous les graphiques
    Object.values(this.charts).forEach(chart => chart.destroy());
  }

  loadDatabases(): void {
    this.databaseService.getAllDatabases().subscribe({
      next: (data) => {
        this.databases = data.filter(db => db.status === 'ACTIVE');
        if (this.databases.length > 0) {
          this.selectedDatabase = this.databases[0];
          this.loadMetrics();
        }
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des bases de données';
      }
    });
  }

  onDatabaseChange(): void {
    this.loadMetrics();
  }

  onMetricTypeChange(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    if (!this.selectedDatabase) {
      return;
    }

    this.loading = true;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 24); // Dernières 24 heures

    this.metricService.getMetricsByDatabaseAndType(
      this.selectedDatabase.id,
      this.selectedMetricType,
      startDate,
      endDate
    ).subscribe({
      next: (data) => {
        this.metrics = data;
        this.updateCharts();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des métriques';
        this.loading = false;
      }
    });
  }

  updateCharts(): void {
    // Grouper les métriques par nom
    const metricsByName: { [key: string]: any[] } = {};

    this.metrics.forEach(metric => {
      if (!metricsByName[metric.metricName]) {
        metricsByName[metric.metricName] = [];
      }
      metricsByName[metric.metricName].push(metric);
    });

    // Créer un graphique pour chaque type de métrique
    Object.entries(metricsByName).forEach(([metricName, metrics]) => {
      const chartId = `chart-${metricName.replace(/\s+/g, '-')}`;
      this.createOrUpdateChart(chartId, metricName, metrics);
    });
  }

  createOrUpdateChart(chartId: string, metricName: string, metrics: any[]): void {
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    if (!canvas) {
      return;
    }

    // Détruire le graphique existant s'il existe
    if (this.charts[chartId]) {
      this.charts[chartId].destroy();
    }

    // Trier les métriques par date
    metrics.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Préparer les données
    const labels = metrics.map(m => new Date(m.timestamp).toLocaleTimeString());
    const data = metrics.map(m => m.metricValue);

    // Configuration du graphique
    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: labels,
        datasets: [{
          label: metricName,
          data: data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Heure'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: metrics[0]?.unit || 'Valeur'
            }
          }
        }
      }
    };

    // Créer le graphique
    this.charts[chartId] = new Chart(canvas, config);
  }

  setupAutoRefresh(): void {
    interval(this.refreshInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadMetrics();
      });
  }

  exportData(): void {
    // Exporter les données au format CSV
    let csv = 'Timestamp,Metric Name,Value,Unit\n';

    this.metrics.forEach(metric => {
      csv += `${metric.timestamp},${metric.metricName},${metric.metricValue},${metric.unit}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrics_${this.selectedDatabase.name}_${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getLatestMetricValue(metricNamePattern: string): string {
    const matchingMetrics = this.metrics.filter(m =>
      m.metricName.includes(metricNamePattern)
    );

    if (matchingMetrics.length === 0) {
      return '0';
    }

    // Trier par date décroissante et prendre la plus récente
    matchingMetrics.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return matchingMetrics[0].metricValue.toFixed(2);
  }

  getAverageMetricValue(metricNamePattern: string): string {
    const matchingMetrics = this.metrics.filter(m =>
      m.metricName.includes(metricNamePattern)
    );

    if (matchingMetrics.length === 0) {
      return '0';
    }

    const sum = matchingMetrics.reduce((acc, m) => acc + m.metricValue, 0);
    return (sum / matchingMetrics.length).toFixed(2);
  }

  getTotalIOOperations(): string {
    const reads = this.metrics.filter(m => m.metricName.includes('Reads'));
    const writes = this.metrics.filter(m => m.metricName.includes('Writes'));

    let total = 0;
    if (reads.length > 0) {
      total += reads[reads.length - 1].metricValue;
    }
    if (writes.length > 0) {
      total += writes[writes.length - 1].metricValue;
    }

    return total.toFixed(0);
  }

  getTotalMemoryUsage(): string {
    const memoryMetrics = this.metrics.filter(m =>
      m.metricType === 'MEMORY_USAGE' && m.unit === 'MEGABYTES'
    );

    if (memoryMetrics.length === 0) {
      return '0';
    }

    const total = memoryMetrics.reduce((acc, m) => acc + m.metricValue, 0);
    return total.toFixed(0);
  }

  getUniqueMetricNames(): string[] {
    const uniqueNames = new Set(this.metrics.map(m => m.metricName));
    return Array.from(uniqueNames);
  }

  getRecentMetrics(): any[] {
    // Retourner les 10 métriques les plus récentes
    return this.metrics
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }

  getMetricStatus(metric: any): string {
    // Déterminer le statut en fonction du type de métrique et de la valeur
    if (metric.metricType === 'CONNECTIONS') {
      if (metric.metricValue > 100) return 'critical';
      if (metric.metricValue > 80) return 'warning';
      return 'normal';
    }

    if (metric.metricType === 'TABLESPACE' && metric.metricName.includes('Usage')) {
      if (metric.metricValue > 95) return 'critical';
      if (metric.metricValue > 80) return 'warning';
      return 'normal';
    }

    if (metric.metricType === 'MEMORY_USAGE') {
      // Supposons que c'est un pourcentage d'utilisation
      if (metric.metricValue > 95) return 'critical';
      if (metric.metricValue > 85) return 'warning';
      return 'normal';
    }

    if (metric.metricType === 'QUERY_PERFORMANCE') {
      if (metric.metricName.includes('Hit Ratio')) {
        if (metric.metricValue < 60) return 'critical';
        if (metric.metricValue < 70) return 'warning';
        return 'normal';
      }
      if (metric.metricName.includes('Long Running Queries')) {
        if (metric.metricValue > 10) return 'critical';
        if (metric.metricValue > 5) return 'warning';
        return 'normal';
      }
    }

    return 'normal';
  }
}
