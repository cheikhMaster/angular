import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MetricService } from '../../../core/services/metric.service';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-io-metrics',
  standalone: false,
  templateUrl: './io-metrics.component.html',
  styleUrls: ['./io-metrics.component.scss']
})
export class IoMetricsComponent implements OnInit, OnChanges {
  @Input() database: any;

  metrics: any[] = [];
  readChart: Chart | null = null;
  writeChart: Chart | null = null;
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
    this.initializeCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['database'] && this.database) {
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
      'IO_OPERATIONS',
      startDate,
      endDate
    ).subscribe({
      next: (data) => {
        this.metrics = data;
        this.updateCharts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des métriques IO', err);
        this.loading = false;
      }
    });
  }

  initializeCharts(): void {
    setTimeout(() => {
      this.initializeReadChart();
      this.initializeWriteChart();
    }, 100);
  }

  initializeReadChart(): void {
    const canvas = document.getElementById('readIOChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: [],
        datasets: [{
          label: 'Opérations de lecture',
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
              text: 'Nombre d\'opérations'
            },
            beginAtZero: true
          }
        }
      }
    };

    this.readChart = new Chart(canvas, config);
  }

  initializeWriteChart(): void {
    const canvas = document.getElementById('writeIOChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: [],
        datasets: [{
          label: 'Opérations d\'écriture',
          data: [],
          borderColor: 'rgb(33, 150, 243)',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
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
              text: 'Nombre d\'opérations'
            },
            beginAtZero: true
          }
        }
      }
    };

    this.writeChart = new Chart(canvas, config);
  }

  updateCharts(): void {
    // Filtrer les métriques par type
    const readMetrics = this.metrics.filter(m => m.metricName.includes('Reads'));
    const writeMetrics = this.metrics.filter(m => m.metricName.includes('Writes'));

    // Trier par date
    readMetrics.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    writeMetrics.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Mettre à jour le graphique de lecture
    if (this.readChart && readMetrics.length > 0) {
      const labels = readMetrics.map(m => new Date(m.timestamp).toLocaleTimeString());
      const values = readMetrics.map(m => m.metricValue);

      this.readChart.data.labels = labels;
      this.readChart.data.datasets[0].data = values;
      this.readChart.update();
    }

    // Mettre à jour le graphique d'écriture
    if (this.writeChart && writeMetrics.length > 0) {
      const labels = writeMetrics.map(m => new Date(m.timestamp).toLocaleTimeString());
      const values = writeMetrics.map(m => m.metricValue);

      this.writeChart.data.labels = labels;
      this.writeChart.data.datasets[0].data = values;
      this.writeChart.update();
    }
  }

  getLatestMetric(metricName: string): number {
    const metrics = this.metrics.filter(m => m.metricName.includes(metricName));
    if (metrics.length === 0) {
      return 0;
    }
    // Trouver la métrique la plus récente
    const latestMetric = metrics.reduce((prev, current) => {
      return new Date(prev.timestamp) > new Date(current.timestamp) ? prev : current;
    });
    return latestMetric.metricValue;
  }

  getAverageMetric(metricName: string): number {
    const metrics = this.metrics.filter(m => m.metricName.includes(metricName));
    if (metrics.length === 0) {
      return 0;
    }
    const sum = metrics.reduce((acc, m) => acc + m.metricValue, 0);
    return sum / metrics.length;
  }

  getMaxMetric(metricName: string): number {
    const metrics = this.metrics.filter(m => m.metricName.includes(metricName));
    if (metrics.length === 0) {
      return 0;
    }
    return Math.max(...metrics.map(m => m.metricValue));
  }

  getRecentIOMetrics(): any[] {
    return this.metrics
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }
}
