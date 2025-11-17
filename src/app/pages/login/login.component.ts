import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, senha, rememberMe } = this.loginForm.value;

    // Simulate API call
    setTimeout(() => {
      // Mock authentication - replace with real API call
      if (email === 'cliente@exemplo.com' && senha === '123456') {
        // Success
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
        const mockClientId = '123';

        if (rememberMe) {
          localStorage.setItem('authToken', mockToken);
          localStorage.setItem('clientId', mockClientId);
        } else {
          sessionStorage.setItem('authToken', mockToken);
          sessionStorage.setItem('clientId', mockClientId);
        }

        this.router.navigate(['/dashboard']);
      } else {
        // Failure
        this.errorMessage = 'E-mail ou senha incorretos. Tente novamente.';
        this.isLoading = false;
      }
    }, 1500);
  }

  forgotPassword(event: Event): void {
    event.preventDefault();
    alert('Funcionalidade de recuperação de senha será implementada em breve.\n\nPor enquanto, use:\nE-mail: cliente@exemplo.com\nSenha: 123456');
  }

  register(event: Event): void {
    event.preventDefault();
    alert('Funcionalidade de cadastro será implementada em breve.');
  }
}
