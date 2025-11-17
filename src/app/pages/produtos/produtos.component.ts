import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface Product {
  id: number;
  nome: string;
  tipo: string;
  rentabilidade: number;
  risco: string;
}

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.scss']
})
export class ProdutosComponent implements OnInit {
  selectedType = 'Todos';
  productTypes = ['Todos', 'CDB', 'LCI', 'LCA', 'Tesouro', 'Fundo'];

  // Mock user profile - in real app, get from service
  userRiskProfile = 'Moderado'; // Conservador, Moderado, Agressivo

  allProducts: Product[] = [
    {
      id: 101,
      nome: 'CDB Caixa 2026',
      tipo: 'CDB',
      rentabilidade: 0.13,
      risco: 'Baixo'
    },
    {
      id: 102,
      nome: 'Fundo Agressivo XPTO',
      tipo: 'Fundo',
      rentabilidade: 0.18,
      risco: 'Alto'
    },
    {
      id: 103,
      nome: 'LCI Imobiliária Premium',
      tipo: 'LCI',
      rentabilidade: 0.11,
      risco: 'Baixo'
    },
    {
      id: 104,
      nome: 'Tesouro IPCA+ 2035',
      tipo: 'Tesouro',
      rentabilidade: 0.14,
      risco: 'Medio'
    },
    {
      id: 105,
      nome: 'LCA Agro Sustentável',
      tipo: 'LCA',
      rentabilidade: 0.12,
      risco: 'Baixo'
    },
    {
      id: 106,
      nome: 'Fundo Multimercado Equilibrado',
      tipo: 'Fundo',
      rentabilidade: 0.15,
      risco: 'Medio'
    },
    {
      id: 107,
      nome: 'CDB Progressivo 2027',
      tipo: 'CDB',
      rentabilidade: 0.14,
      risco: 'Medio'
    },
    {
      id: 108,
      nome: 'Tesouro Selic 2028',
      tipo: 'Tesouro',
      rentabilidade: 0.10,
      risco: 'Baixo'
    },
    {
      id: 109,
      nome: 'Fundo de Ações Dinamico',
      tipo: 'Fundo',
      rentabilidade: 0.22,
      risco: 'Alto'
    },
    {
      id: 110,
      nome: 'CDB Liquidez Diária',
      tipo: 'CDB',
      rentabilidade: 0.09,
      risco: 'Baixo'
    },
    {
      id: 111,
      nome: 'LCI Caixa Rentabilidade',
      tipo: 'LCI',
      rentabilidade: 0.12,
      risco: 'Baixo'
    },
    {
      id: 112,
      nome: 'Tesouro Prefixado 2030',
      tipo: 'Tesouro',
      rentabilidade: 0.13,
      risco: 'Medio'
    }
  ];

  recommendedProducts: Product[] = [];
  filteredProducts: Product[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadRecommendedProducts();
    this.filteredProducts = [...this.allProducts];
  }

  loadRecommendedProducts(): void {
    // Filter products based on user risk profile
    const riskMapping: { [key: string]: string[] } = {
      'Conservador': ['Baixo'],
      'Moderado': ['Baixo', 'Medio'],
      'Agressivo': ['Baixo', 'Medio', 'Alto']
    };

    const allowedRisks = riskMapping[this.userRiskProfile] || ['Baixo'];
    
    this.recommendedProducts = this.allProducts
      .filter(product => allowedRisks.includes(product.risco))
      .sort((a, b) => b.rentabilidade - a.rentabilidade)
      .slice(0, 3); // Show top 3 recommended products
  }

  filterByType(type: string): void {
    this.selectedType = type;
    
    if (type === 'Todos') {
      this.filteredProducts = [...this.allProducts];
    } else {
      this.filteredProducts = this.allProducts.filter(
        product => product.tipo === type
      );
    }
  }

  getRiskClass(risco: string): string {
    return risco.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  simulateInvestment(product: Product): void {
    // Navigate to simulation page with product data
    console.log('Simulating investment for:', product);
    this.router.navigate(['/simulacao'], { 
      queryParams: { 
        productId: product.id,
        productName: product.nome 
      } 
    });
  }
}
