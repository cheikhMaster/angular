import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MonitoringRoutingModule } from './monitoring-routing.module';
import { MetricsDashboardComponent } from './metrics-dashboard/metrics-dashboard.component';
import { ConnectionMetricsComponent } from './connection-metrics/connection-metrics.component';
import { TablespaceMetricsComponent } from './tablespace-metrics/tablespace-metrics.component';
import { IoMetricsComponent } from './io-metrics/io-metrics.component';
import { NetworkMetricsComponent } from './network-metrics/network-metrics.component';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SharedModule } from '../../shared/shared.module';
import { MonitoringDashboardComponent } from './monitoring-dashboard/monitoring-dashboard.component';

const routes: Routes = [
  { path: '', component: MetricsDashboardComponent },
  { path: 'connections', component: ConnectionMetricsComponent },
  { path: 'tablespace', component: TablespaceMetricsComponent },
  { path: 'io', component: IoMetricsComponent },
  { path: 'network', component: NetworkMetricsComponent }
];

@NgModule({
  declarations: [
    MetricsDashboardComponent,
    ConnectionMetricsComponent,
    TablespaceMetricsComponent,
    IoMetricsComponent,
    NetworkMetricsComponent,
    MonitoringDashboardComponent
  ],
  imports: [
    CommonModule,
    MonitoringRoutingModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatCardModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatTooltipModule
  ]
})
export class MonitoringModule { }
