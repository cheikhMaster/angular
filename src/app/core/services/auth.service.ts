// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<User> {
    console.log('AuthService: tentative login', username);

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          console.log('AuthService: réponse reçue', response);
        }),
        map(response => {
          console.log('AuthService: traitement de la réponse');
          // Store JWT token and user details
          localStorage.setItem('token', response.token);

          const user: User = {
            id: response.id,
            username: response.username,
            email: response.email,
            role: response.role
          };

          localStorage.setItem('currentUser', JSON.stringify(user));
          console.log('AuthService: utilisateur stocké dans localStorage');
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          console.error('AuthService: erreur de connexion', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    // Remove user from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === 'ADMIN';
  }
}
