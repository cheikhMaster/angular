// src/app/features/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone : false ,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  error = '';
  returnUrl = '/';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    // Redirect to home if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit(): void {
    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      console.log('Formulaire invalide');
      return;
    }

    this.loading = true;
    this.error = '';

    const { username, password } = this.loginForm.value;
    console.log('Tentative de connexion avec:', username);

    this.authService.login(username, password)
      .subscribe({
        next: (user) => {
          console.log('Connexion réussie:', user);
          console.log('Redirection vers:', this.returnUrl);
          this.router.navigate(['/dashboard']);

        },
        error: (err) => {
          console.error('Erreur de connexion:', err);
          this.error = err.error?.message || 'Nom d\'utilisateur ou mot de passe incorrect';
          this.loading = false;
        },
        complete: () => {
          console.log('Observable complété');
        }
      });
  }
}
