import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `<section class="page"><h1>Dashboard</h1><p>Área do painel com gráficos e visão geral.</p></section>`,
  styles: [`.page{padding:1.5rem}`]
})
export class DashboardComponent {}
