import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `<section class="page"><h1>Login</h1><p>Área de autenticação.</p></section>`,
  styles: [`.page{padding:1.5rem}`]
})
export class LoginComponent {}
