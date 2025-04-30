import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BackupRoutingModule } from './backup-routing.module';
import { BackupListComponent } from './backup-list/backup-list.component';
import { BackupFormComponent } from './backup-form/backup-form.component';
import { BackupDetailComponent } from './backup-detail/backup-detail.component';

import { ReactiveFormsModule } from '@angular/forms'; // Très important pour formGroup

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [
    BackupListComponent,
    BackupFormComponent,
    BackupDetailComponent
  ],
  imports: [
    CommonModule,
    BackupRoutingModule,
    ReactiveFormsModule, // Pour formGroup
    // Material modules
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
  ]
})
export class BackupModule { }
