

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatabaseService } from '../../../core/services/database.service';
import { BackupService } from '../../../core/services/backup.service';

@Component({
  selector: 'app-backup-form',
  standalone: false,
  templateUrl: './backup-form.component.html',
  styleUrl: './backup-form.component.scss'
})
export class BackupFormComponent implements OnInit {
  backupForm!: FormGroup;
  databases: any[] = [];
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private databaseService: DatabaseService,
    private backupService: BackupService
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.loadDatabases();
  }

  createForm(): void {
    this.backupForm = this.formBuilder.group({
      databaseId: ['', Validators.required],
      backupType: ['FULL', Validators.required],
      description: ['']
    });
  }

  loadDatabases(): void {
    this.databaseService.getAllDatabases().subscribe({
      next: (data) => {
        this.databases = data;
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du chargement des bases de données', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  onSubmit(): void {
    if (this.backupForm.invalid) {
      return;
    }

    this.loading = true;
    const backupData = this.backupForm.value;

    this.backupService.initiateBackup(backupData).subscribe({
      next: (response) => {
        this.snackBar.open('Sauvegarde initiée avec succès', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
        this.router.navigate(['/backups']);
      },
      error: (err) => {
        this.snackBar.open('Erreur lors de l\'initiation de la sauvegarde: ' + (err.error?.message || 'Erreur inconnue'), 'Fermer', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }
}
