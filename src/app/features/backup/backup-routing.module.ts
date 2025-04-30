import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackupListComponent } from './backup-list/backup-list.component';
import { BackupFormComponent } from './backup-form/backup-form.component';

const routes: Routes = [
  { path: '', component: BackupListComponent },
  { path: 'new', component: BackupFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackupRoutingModule { }
