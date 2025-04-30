
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BackupService } from '../../../core/services/backup.service';

@Component({
  selector: 'app-backup-list',
  standalone: false,
  templateUrl: './backup-list.component.html',
  styleUrl: './backup-list.component.scss'
})
export class BackupListComponent {
  backups: any[] = [];
  loading = true;
  displayedColumns: string[] = ['id', 'database', 'type', 'startTime', 'endTime', 'status', 'size', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private backupService: BackupService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadBackups();
  }

  loadBackups(): void {
    this.loading = true;
    this.backupService.getAllBackups().subscribe({
      next: (data) => {
        this.backups = data;
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du chargement des sauvegardes', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  getBackupTypeLabel(type: string): string {
    switch (type) {
      case 'FULL':
        return 'Complète';
      case 'INCREMENTAL':
        return 'Incrémentale';
      default:
        return type;
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'COMPLETED':
        return 'Terminée';
      case 'FAILED':
        return 'Échec';
      case 'CANCELED':
        return 'Annulée';
      default:
        return status;
    }
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '-';

    const sizes = ['o', 'Ko', 'Mo', 'Go', 'To'];
    if (bytes === 0) return '0 o';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  }

  canCancel(backup: any): boolean {
    return backup.status === 'PENDING' || backup.status === 'IN_PROGRESS';
  }

  viewBackupDetails(id: number): void {
    // Implémentez la logique pour afficher les détails
  }

  cancelBackup(id: number): void {
    this.backupService.cancelBackup(id).subscribe({
      next: () => {
        this.snackBar.open('Sauvegarde annulée avec succès', 'Fermer', {
          duration: 3000
        });
        this.loadBackups();
      },
      error: (err) => {
        this.snackBar.open('Erreur lors de l\'annulation de la sauvegarde', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  deleteBackup(id: number): void {
    // Ajoutez une boîte de dialogue de confirmation ici si nécessaire
    this.backupService.deleteBackup(id).subscribe({
      next: () => {
        this.snackBar.open('Sauvegarde supprimée avec succès', 'Fermer', {
          duration: 3000
        });
        this.loadBackups();
      },
      error: (err) => {
        this.snackBar.open('Erreur lors de la suppression de la sauvegarde', 'Fermer', {
          duration: 3000
        });
      }
    });
  }
}
