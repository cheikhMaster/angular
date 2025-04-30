import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MonitoringRoutingModule } from './monitoring-routing.module';
import { MetricsDashboardComponent } from './metrics-dashboard/metrics-dashboard.component';
import { ConnectionMetricsComponent } from './connection-metrics/connection-metrics.component';
import { TablespaceMetricsComponent } from './tablespace-metrics/tablespace-metrics.component';
import { IoMetricsComponent } from './io-metrics/io-metrics.component';
import { NetworkMetricsComponent } from './network-metrics/network-metrics.component';


@NgModule({
  declarations: [
    MetricsDashboardComponent,
    ConnectionMetricsComponent,
    TablespaceMetricsComponent,
    IoMetricsComponent,
    NetworkMetricsComponent
  ],
  imports: [
    CommonModule,
    MonitoringRoutingModule
  ]
})
export class MonitoringModule { }
