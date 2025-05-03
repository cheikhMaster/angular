import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatabaseService } from '../../../core/services/database.service';

@Component({
  selector: 'app-database-form',
  standalone : false,
  templateUrl: './database-form.component.html',
  styleUrls: ['./database-form.component.scss']
})
export class DatabaseFormComponent implements OnInit {
  databaseForm!: FormGroup;
  isEditMode = false;
  databaseId?: number;
  loading = false;
  connectionTestResult: { success: boolean, message: string } | null = null;

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
      hostname: ['', Validators.required],
      port: [1521, [Validators.required, Validators.min(1), Validators.max(65535)]],
      username: ['', Validators.required],
      password: ['', this.isEditMode ? [] : Validators.required],
      isLocal: [false],

      // Champs spécifiques à Oracle
      oracleConnectionType: ['sid'], // Par défaut, utiliser SID
      sid: ['ORCL'], // SID par défaut
      serviceName: [''],
      tnsName: [''],
      tnsAdmin: ['']
    });
  }

  loadDatabaseData(id: number): void {
    this.loading = true;
    this.databaseService.getDatabaseById(id).subscribe({
      next: (data) => {
        const formData = {
          ...data,
          hostname: data.address,
          password: '',
          isLocal: data.isLocal, // <-- Ajout de cette ligne
          oracleConnectionType: data.sid ? 'sid' : (data.serviceName ? 'serviceName' : 'tns')
        };
        this.databaseForm.patchValue(formData);
        this.loading = false;
      },
      error: (err) => {
        // Gestion erreur
      }
    });
}

  isOracleDatabase(): boolean {
    return this.databaseForm.get('type')?.value === 'ORACLE';
  }

  onDatabaseTypeChange(): void {
    const type = this.databaseForm.get('type')?.value;
    if (type === 'ORACLE') {
      this.databaseForm.get('port')?.setValue(1521); // Port par défaut pour Oracle
    } else if (type === 'MYSQL') {
      this.databaseForm.get('port')?.setValue(3306); // Port par défaut pour MySQL
    } else if (type === 'POSTGRES') {
      this.databaseForm.get('port')?.setValue(5432); // Port par défaut pour PostgreSQL
    } else if (type === 'SQLSERVER') {
      this.databaseForm.get('port')?.setValue(1433); // Port par défaut pour SQL Server
    }
  }

  testConnection(): void {
    this.loading = true;
    this.connectionTestResult = null;

    // Préparer les données pour le test de connexion
    const connectionData = {
      ...this.databaseForm.value,
      address: this.databaseForm.get('hostname')?.value // Mapper hostname vers address pour le backend
    };

    this.databaseService.testConnection(connectionData).subscribe({
      next: (response) => {
        this.connectionTestResult = { success: true, message: 'Connexion réussie!' };
        this.snackBar.open('Connexion réussie!', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loading = false;
      },
      error: (err) => {
        this.connectionTestResult = { success: false, message: err.error?.message || 'Échec de la connexion' };
        this.snackBar.open('Échec de la connexion: ' + (err.error?.message || 'Erreur inconnue'), 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
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

    // Préparer les données pour l'envoi au backend
    const databaseData = {
      ...this.databaseForm.value,
      address: this.databaseForm.get('hostname')?.value // Mapper hostname vers address pour le backend
    };

    console.log('Données complètes envoyées:', JSON.stringify(databaseData, null, 2));
    console.log('isLocal value:', databaseData.isLocal, typeof databaseData.isLocal);

    // Supprimer les champs inutiles selon le type de connexion Oracle
    if (databaseData.type === 'ORACLE') {
      if (databaseData.oracleConnectionType === 'sid') {
        databaseData.serviceName = null;
        databaseData.tnsName = null;
        databaseData.tnsAdmin = null;
      } else if (databaseData.oracleConnectionType === 'serviceName') {
        databaseData.sid = null;
        databaseData.tnsName = null;
        databaseData.tnsAdmin = null;
      } else if (databaseData.oracleConnectionType === 'tns') {
        databaseData.sid = null;
        databaseData.serviceName = null;
      }
    } else {
      // Si ce n'est pas Oracle, supprimer tous les champs spécifiques à Oracle
      databaseData.sid = null;
      databaseData.serviceName = null;
      databaseData.tnsName = null;
      databaseData.tnsAdmin = null;
    }

    // Supprimer le champ oracleConnectionType qui n'est pas attendu par le backend
    delete databaseData.oracleConnectionType;

    // Aussi supprimer le champ hostname qui n'est pas attendu par le backend
    delete databaseData.hostname;

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
