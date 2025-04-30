import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  // Route par défaut qui redirige vers auth/login
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  // Routes protégées dans le layout principal
 // Routes protégées dans le layout principal
{
  path: '',
  component: MainLayoutComponent,
  canActivate: [AuthGuard],
  children: [
    {
      path: 'dashboard',
      loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    {
      path: 'databases',
      loadChildren: () => import('./features/database-management/database-management.module').then(m => m.DatabaseManagementModule)
    },
    {
      path: 'backups',
      loadChildren: () => import('./features/backup/backup.module').then(m => m.BackupModule)
    },
    {
      path: 'monitoring',
      loadChildren: () => import('./features/monitoring/monitoring.module').then(m => m.MonitoringModule)
    },
    {
      path: 'logs',
      loadChildren: () => import('./features/activity-logs/activity-logs.module').then(m => m.ActivityLogsModule)
    },
    {
      path: 'users',
      loadChildren: () => import('./features/user-management/user-management.module').then(m => m.UserManagementModule)
    }
  ]
},
  // Routes d'authentification
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
      }
    ]
  },
  // Route fallback pour toute URL non reconnue
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
