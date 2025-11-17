import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

interface LoginRequest {
  email: string;
  senha: string;
}

interface LoginResponse {
  token: string;
  clienteId: number;
}

interface UserProfile {
  clienteId: number;
  nome: string;
  email: string;
  perfilRisco: {
    id: number;
    name: string;
    description: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<number | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize with stored clientId if exists
    const clientId = this.getStoredClientId();
    if (clientId) {
      this.currentUserSubject.next(clientId);
    }
  }

  login(email: string, senha: string, rememberMe: boolean = false): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/autenticacao/login`, { email, senha })
      .pipe(
        tap(response => {
          // Store authentication data
          if (rememberMe) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('clientId', response.clienteId.toString());
          } else {
            sessionStorage.setItem('authToken', response.token);
            sessionStorage.setItem('clientId', response.clienteId.toString());
          }
          
          // Update current user
          this.currentUserSubject.next(response.clienteId);
        })
      );
  }

  logout(): void {
    // Clear all stored authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('clientId');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('clientId');
    
    // Reset current user
    this.currentUserSubject.next(null);
    
    // Navigate to login
    this.router.navigate(['/login']);
  }

  getStoredToken(): string | null {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  getStoredClientId(): number | null {
    const clientId = localStorage.getItem('clientId') || sessionStorage.getItem('clientId');
    return clientId ? parseInt(clientId, 10) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  getUserProfile(clienteId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/perfil-risco/${clienteId}`);
  }

  updateRiskProfile(clienteId: number, riskProfileId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/perfil-risco`, { clienteId, riskProfileId });
  }
}
