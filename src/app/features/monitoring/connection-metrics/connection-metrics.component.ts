import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MetricService } from '../../../core/services/metric.service';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-connection-metrics',
  standalone: false,
  templateUrl: './connection-metrics.component.html',
  styleUrls: ['./connection-metrics.component.scss']
})
export class ConnectionMetricsComponent implements OnInit, OnChanges {
  @Input() database: any;

  metrics: any[] = [];
  chartData: any;
  chartOptions: any;
  chart: Chart | null = null;
  loading = false;

  timeRanges = [
    { label: 'Dernière heure', hours: 1 },
    { label: 'Dernières 6 heures', hours: 6 },
    { label: 'Dernières 24 heures', hours: 24 },
    { label: 'Dernière semaine', hours: 168 }
  ];
  selectedTimeRange = this.timeRanges[0];

  constructor(private metricService: MetricService) { }

  ngOnInit(): void {
    this.initializeChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['database'] && !changes['database'].firstChange) {
      this.loadMetrics();
    }
  }

  onTimeRangeChange(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    if (!this.database) {
      return;
    }
    this.loading = true;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - this.selectedTimeRange.hours);

    this.metricService.getMetricsByDatabaseAndType(
      this.database.id,
      'CONNECTIONS',
      startDate,
      endDate
    ).subscribe({
      next: (data) => {
        this.metrics = data;
        this.updateChart();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des métriques de connexion', err);
        this.loading = false;
      }
    });
  }

  initializeChart(): void {
    const canvas = document.getElementById('connectionsChart') as HTMLCanvasElement;
    if (!canvas) {
      setTimeout(() => this.initializeChart(), 100);
      return;
    }

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: [],
        datasets: [{
          label: 'Sessions actives',
          data: [],
          borderColor: 'rgb(33, 150, 243)',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.1
        }, {
          label: 'Sessions totales',
          data: [],
          borderColor: 'rgb(76, 175, 80)',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
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
              text: 'Nombre de sessions'
            },
            beginAtZero: true
          }
        }
      }
    };

    this.chart = new Chart(canvas, config);
    this.loadMetrics();
  }

  updateChart(): void {
    if (!this.chart) {
      return;
    }

    // Séparer les métriques par type
    const activeSessionsMetrics = this.metrics.filter(m => m.metricName === 'Active Sessions');
    const totalSessionsMetrics = this.metrics.filter(m => m.metricName === 'Total Sessions');

    // Trier par date
    activeSessionsMetrics.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    totalSessionsMetrics.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Préparer les données
    const labels = activeSessionsMetrics.map(m => new Date(m.timestamp).toLocaleTimeString());
    const activeData = activeSessionsMetrics.map(m => m.metricValue);
    const totalData = totalSessionsMetrics.map(m => m.metricValue);

    // Mettre à jour le graphique
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = activeData;
    this.chart.data.datasets[1].data = totalData;
    this.chart.update();
  }

  getLatestMetric(metricName: string): number {
    const metrics = this.metrics.filter(m => m.metricName === metricName);
    if (metrics.length === 0) {
      return 0;
    }
    return metrics[metrics.length - 1].metricValue;
  }

  getAverageMetric(metricName: string): number {
    const metrics = this.metrics.filter(m => m.metricName === metricName);
    if (metrics.length === 0) {
      return 0;
    }
    const sum = metrics.reduce((acc, m) => acc + m.metricValue, 0);
    return sum / metrics.length;
  }

  getMaxMetric(metricName: string): number {
    const metrics = this.metrics.filter(m => m.metricName === metricName);
    if (metrics.length === 0) {
      return 0;
    }
    return Math.max(...metrics.map(m => m.metricValue));
  }
}
