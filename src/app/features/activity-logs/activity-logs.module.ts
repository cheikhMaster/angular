import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivityLogsRoutingModule } from './activity-logs-routing.module';
import { ActivityLogListComponent } from './activity-log-list/activity-log-list.component';


@NgModule({
  declarations: [
    ActivityLogListComponent
  ],
  imports: [
    CommonModule,
    ActivityLogsRoutingModule
  ]
})
export class ActivityLogsModule { }
