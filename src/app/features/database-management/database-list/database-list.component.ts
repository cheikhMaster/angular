// database-list.component.ts
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DatabaseService } from '../../../core/services/database.service';

@Component({
  selector: 'app-database-list',
  standalone : false,
  templateUrl: './database-list.component.html',
  styleUrls: ['./database-list.component.scss']
})
export class DatabaseListComponent implements OnInit {
  databases: any[] = [];
  loading = true;
  displayedColumns: string[] = ['name', 'type', 'address', 'status', 'isLocal', 'actions'];

  constructor(
    private databaseService: DatabaseService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadDatabases();
  }

  loadDatabases(): void {
    this.loading = true;
    this.databaseService.getAllDatabases().subscribe({
      next: (data) => {
        console.log('Bases de données chargées:', data);
        this.databases = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des bases de données:', err);
        this.snackBar.open('Erreur lors du chargement des bases de données', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
        // Pour faciliter les tests, ajoutez temporairement ce code
        this.databases = [];
        this.loading = false;
      }
    });
  }

  testDatabaseConnection(id: number): void {
    this.snackBar.open('Test de connexion en cours...', '', {
      duration: 2000
    });
    // Implémentation à faire
  }

  deleteDatabase(id: number): void {
    // Ajouter une confirmation avant de supprimer
    if (confirm('Êtes-vous sûr de vouloir supprimer cette base de données?')) {
      this.databaseService.deleteDatabase(id).subscribe({
        next: () => {
          this.snackBar.open('Base de données supprimée avec succès', 'Fermer', {
            duration: 3000
          });
          this.loadDatabases();
        },
        error: (err) => {
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000
          });
        }
      });
    }
  }
}
