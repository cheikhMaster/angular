// database-management-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatabaseListComponent } from './database-list/database-list.component';
import { DatabaseFormComponent } from './database-form/database-form.component';

const routes: Routes = [
  { path: '', component: DatabaseListComponent },
  { path: 'new', component: DatabaseFormComponent },
  { path: 'edit/:id', component: DatabaseFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatabaseManagementRoutingModule { }
