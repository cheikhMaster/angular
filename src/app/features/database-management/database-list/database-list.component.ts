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
        console.log('Données brutes des bases de données:', data);

        // Vérifier chaque objet
        this.databases = data.map(db => {
          console.log(`Base de données ${db.name}, isLocal:`, db.isLocal);
          return {
            ...db,
            isLocal: db.local !== undefined ? db.local : db.isLocal // Vérifier les deux noms possibles
          };
        });

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
