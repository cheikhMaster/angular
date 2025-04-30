import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatabaseService } from '../../../core/services/database.service';

@Component({
  selector: 'app-database-form',
  standalone: false,
  templateUrl: './database-form.component.html',
  styleUrl: './database-form.component.scss'
})
export class DatabaseFormComponent {
  databaseForm!: FormGroup;
  isEditMode = false;
  databaseId?: number;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private databaseService: DatabaseService
  ) { }

  ngOnInit(): void {
    // Vérifier s'il s'agit d'une édition ou d'un ajout
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.databaseId = +params['id'];
        this.loadDatabaseData(this.databaseId);
      }
      this.initForm();
    });
  }

  initForm(): void {
    this.databaseForm = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['ORACLE', Validators.required],
      address: ['', Validators.required],
      port: [1521, [Validators.required, Validators.min(1), Validators.max(65535)]],
      username: ['', Validators.required],
      password: ['', this.isEditMode ? [] : Validators.required],
      isLocal: [false]
    });
  }

  loadDatabaseData(id: number): void {
    this.loading = true;
    this.databaseService.getDatabaseById(id).subscribe({
      next: (data) => {
        // Ne pas inclure le mot de passe dans les données chargées
        const formData = { ...data, password: '' };
        this.databaseForm.patchValue(formData);
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du chargement des données', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.databaseForm.invalid) {
      return;
    }

    this.loading = true;
    const databaseData = this.databaseForm.value;

    if (this.isEditMode && this.databaseId) {
      this.databaseService.updateDatabase(this.databaseId, databaseData).subscribe({
        next: (response) => {
          this.snackBar.open('Base de données mise à jour avec succès', 'Fermer', {
            duration: 3000
          });
          this.loading = false;
          this.router.navigate(['/databases']);
        },
        error: (err) => {
          this.snackBar.open('Erreur lors de la mise à jour: ' + (err.error?.message || 'Erreur inconnue'), 'Fermer', {
            duration: 5000
          });
          this.loading = false;
        }
      });
    } else {
      this.databaseService.createDatabase(databaseData).subscribe({
        next: (response) => {
          this.snackBar.open('Base de données ajoutée avec succès', 'Fermer', {
            duration: 3000
          });
          this.loading = false;
          this.router.navigate(['/databases']);
        },
        error: (err) => {
          this.snackBar.open('Erreur lors de l\'ajout: ' + (err.error?.message || 'Erreur inconnue'), 'Fermer', {
            duration: 5000
          });
          this.loading = false;
        }
      });
    }
  }
}
