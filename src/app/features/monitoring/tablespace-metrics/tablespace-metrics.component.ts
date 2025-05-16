import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MetricService } from '../../../core/services/metric.service';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-tablespace-metrics',
  standalone: false,
  templateUrl: './tablespace-metrics.component.html',
  styleUrls: ['./tablespace-metrics.component.scss']
})
export class TablespaceMetricsComponent implements OnInit, OnChanges {
  @Input() database: any;

  metrics: any[] = [];
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
      'TABLESPACE',
      startDate,
      endDate
    ).subscribe({
      next: (data) => {
        this.metrics = data;
        this.updateChart();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des métriques tablespace', err);
        this.loading = false;
      }
    });
  }

  initializeChart(): void {
    const canvas = document.getElementById('tablespaceDetailChart') as HTMLCanvasElement;
    if (!canvas) {
      setTimeout(() => this.initializeChart(), 100);
      return;
    }

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: [],
        datasets: [{
          label: 'Utilisation (%)',
          data: [],
          backgroundColor: 'rgba(33, 150, 243, 0.7)',
          borderColor: 'rgb(33, 150, 243)',
          borderWidth: 1
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
              text: 'Tablespace'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Utilisation (%)'
            },
            beginAtZero: true,
            max: 100
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

    // Regrouper les métriques par tablespace (utilisation la plus récente)
    const tablespaceMap = new Map<string, number>();

    this.metrics.forEach(metric => {
      if (metric.metricName.includes('Usage')) {
        const tablespaceName = metric.metricName.replace(' Usage', '');
        const timestamp = new Date(metric.timestamp).getTime();

        if (!tablespaceMap.has(tablespaceName) ||
            timestamp > tablespaceMap.get(tablespaceName)!) {
          tablespaceMap.set(tablespaceName, metric.metricValue);
        }
      }
    });

    // Convertir en tableaux pour le graphique
    const tablespaces = Array.from(tablespaceMap.keys());
    const usageValues = tablespaces.map(name => {
      const value = tablespaceMap.get(name);
      // Convertir undefined en null pour être compatible avec Chart.js
      return value !== undefined ? value : null;
    });

    // Mettre à jour le graphique
    this.chart.data.labels = tablespaces;
    this.chart.data.datasets[0].data = usageValues;
    this.chart.update();
  }

  getTablespaceDetails(): any[] {
    // Regrouper les métriques par tablespace
    const tablespaceData: { [key: string]: any } = {};

    this.metrics.forEach(metric => {
      if (metric.metricName.includes('Usage')) {
        const tablespaceName = metric.metricName.replace(' Usage', '');

        if (!tablespaceData[tablespaceName]) {
          tablespaceData[tablespaceName] = {
            name: tablespaceName,
            usagePercent: 0,
            sizeBytes: 0,
            freeBytes: 0,
            timestamp: new Date(0)
          };
        }

        const timestamp = new Date(metric.timestamp);
        if (timestamp > tablespaceData[tablespaceName].timestamp) {
          tablespaceData[tablespaceName].usagePercent = metric.metricValue;
          tablespaceData[tablespaceName].timestamp = timestamp;
        }
      } else if (metric.metricName.includes('Size')) {
        const tablespaceName = metric.metricName.replace(' Size', '');

        if (!tablespaceData[tablespaceName]) {
          tablespaceData[tablespaceName] = {
            name: tablespaceName,
            usagePercent: 0,
            sizeBytes: 0,
            freeBytes: 0,
            timestamp: new Date(0)
          };
        }

        const timestamp = new Date(metric.timestamp);
        if (timestamp > tablespaceData[tablespaceName].timestamp) {
          tablespaceData[tablespaceName].sizeBytes = metric.metricValue;
          tablespaceData[tablespaceName].timestamp = timestamp;
        }
      }
    });

    // Calculer l'espace libre pour chaque tablespace
    Object.values(tablespaceData).forEach(tablespace => {
      tablespace.freeBytes = tablespace.sizeBytes * (1 - tablespace.usagePercent / 100);
    });

    return Object.values(tablespaceData).sort((a, b) => b.usagePercent - a.usagePercent);
  }

  getStatusClass(usagePercent: number): string {
    if (usagePercent > 90) {
      return 'critical';
    } else if (usagePercent > 75) {
      return 'warning';
    } else {
      return 'normal';
    }
  }
}
