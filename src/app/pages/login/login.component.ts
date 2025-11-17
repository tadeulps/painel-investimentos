import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
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

    this.authService.login(email, senha, rememberMe).subscribe({
      next: (response) => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        // Handle error
        this.isLoading = false;
        if (error.status === 401) {
          this.errorMessage = 'E-mail ou senha incorretos. Tente novamente.';
        } else if (error.status === 400) {
          this.errorMessage = 'Por favor, preencha todos os campos.';
        } else {
          this.errorMessage = 'Erro ao fazer login. Tente novamente mais tarde.';
        }
      }
    });
  }

  forgotPassword(event: Event): void {
    event.preventDefault();
    alert('Funcionalidade de recuperação de senha será implementada em breve.\n\nPor enquanto, use:\nE-mail: tadeu@caixa.com\nSenha: 123456');
  }

  register(event: Event): void {
    event.preventDefault();
    alert('Funcionalidade de cadastro será implementada em breve.');
  }
}
