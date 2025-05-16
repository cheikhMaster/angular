import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MetricService } from '../../../core/services/metric.service';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-network-metrics',
  standalone: false,
  templateUrl: './network-metrics.component.html',
  styleUrls: ['./network-metrics.component.scss']
})
export class NetworkMetricsComponent implements OnInit, OnChanges {
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
      'NETWORK_TRAFFIC',
      startDate,
      endDate
    ).subscribe({
      next: (data) => {
        this.metrics = data;
        this.updateChart();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des métriques réseau', err);
        this.loading = false;
      }
    });
  }

  initializeChart(): void {
    const canvas = document.getElementById('networkTrafficChart') as HTMLCanvasElement;
    if (!canvas) {
      setTimeout(() => this.initializeChart(), 100);
      return;
    }

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: [],
        datasets: [{
          label: 'Trafic entrant (Mbps)',
          data: [],
          borderColor: 'rgb(76, 175, 80)',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.1
        }, {
          label: 'Trafic sortant (Mbps)',
          data: [],
          borderColor: 'rgb(244, 67, 54)',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
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
              text: 'Trafic (Mbps)'
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

    // Filtrer et trier les données
    const inboundMetrics = this.metrics.filter(m => m.metricName.includes('Inbound'));
    const outboundMetrics = this.metrics.filter(m => m.metricName.includes('Outbound'));

    inboundMetrics.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    outboundMetrics.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Utiliser la série de temps la plus longue pour les labels
    const timestamps = inboundMetrics.length >= outboundMetrics.length
      ? inboundMetrics.map(m => m.timestamp)
      : outboundMetrics.map(m => m.timestamp);

    const labels = timestamps.map(t => new Date(t).toLocaleTimeString());
    const inboundValues = inboundMetrics.map(m => m.metricValue);
    const outboundValues = outboundMetrics.map(m => m.metricValue);

    // Mettre à jour le graphique
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = inboundValues;
    this.chart.data.datasets[1].data = outboundValues;
    this.chart.update();
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

  getTotalTraffic(): number {
    const inbound = this.getLatestMetric('Inbound') || 0;
    const outbound = this.getLatestMetric('Outbound') || 0;
    return inbound + outbound;
  }

  getMaxTraffic(): number {
    const inboundMax = Math.max(...this.metrics
      .filter(m => m.metricName.includes('Inbound'))
      .map(m => m.metricValue), 0);

    const outboundMax = Math.max(...this.metrics
      .filter(m => m.metricName.includes('Outbound'))
      .map(m => m.metricValue), 0);

    return inboundMax + outboundMax;
  }

  getNetworkLatency(): number {
    // Simulé pour la démonstration
    const latencyMetrics = this.metrics.filter(m => m.metricName.includes('Latency'));
    if (latencyMetrics.length === 0) {
      return Math.random() * 10 + 5; // Valeur simulée entre 5 et 15 ms
    }
    return latencyMetrics[latencyMetrics.length - 1].metricValue;
  }

  getNetworkStatus(): string {
    const totalTraffic = this.getTotalTraffic();

    if (totalTraffic > 80) {
      return 'critical';
    } else if (totalTraffic > 50) {
      return 'warning';
    }
    return 'normal';
  }

  getRecentNetworkMetrics(): any[] {
    return this.metrics
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }
}
