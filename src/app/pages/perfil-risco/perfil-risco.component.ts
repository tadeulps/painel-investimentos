import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil-risco',
  standalone: true,
  imports: [CommonModule],
  template: `<section class="page"><h1>Perfil de Risco</h1><p>Visualização do perfil do cliente.</p></section>`,
  styles: [`.page{padding:1.5rem}`]
})
export class PerfilRiscoComponent {}
