import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simulacao',
  standalone: true,
  imports: [CommonModule],
  template: `<section class="page"><h1>Simulação</h1><p>Simulador de investimentos.</p></section>`,
  styles: [`.page{padding:1.5rem}`]
})
export class SimulacaoComponent {}
