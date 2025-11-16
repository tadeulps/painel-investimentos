import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule],
  template: `<section class="page"><h1>Produtos</h1><p>Lista de produtos recomendados.</p></section>`,
  styles: [`.page{padding:1.5rem}`]
})
export class ProdutosComponent {}
