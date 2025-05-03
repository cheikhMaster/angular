import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DatabaseManagementRoutingModule } from './database-management-routing.module';
import { DatabaseListComponent } from './database-list/database-list.component';
import { DatabaseFormComponent } from './database-form/database-form.component';
import { DatabaseDetailComponent } from './database-detail/database-detail.component';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';


import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
@NgModule({
  declarations: [
    DatabaseListComponent,
    DatabaseFormComponent,
    DatabaseDetailComponent
  ],
  imports: [
    CommonModule,
    DatabaseManagementRoutingModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatMenuModule,
    MatRadioModule
  ]
})
export class DatabaseManagementModule { }
