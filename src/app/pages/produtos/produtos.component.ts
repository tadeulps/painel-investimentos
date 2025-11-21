import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InvestmentService, Product } from '../../services/investment.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatBadgeModule,
    PageHeaderComponent
  ],
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.scss']
})
export class ProdutosComponent implements OnInit {
  selectedType = 'Todos';
  productTypes = ['Todos', 'Renda Fixa', 'Tesouro Direto', 'Fundos', 'Renda Variável', 'Estruturados'];

  userRiskProfileId: number | null = null;
  clienteId: number | null = null;
  isLoading = false;

  allProducts: Product[] = [];
  originalProducts: Product[] = [
  ];

  recommendedProducts: Product[] = [];
  filteredProducts: Product[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private investmentService: InvestmentService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.clienteId = this.authService.getStoredClientId();

    if (!this.clienteId) {
      console.error('Cliente ID não encontrado');
      this.isLoading = false;
      return;
    }

    // Load user profile first
    this.authService.getUserProfile(this.clienteId).subscribe({
      next: (userProfile) => {
        this.userRiskProfileId = userProfile.perfilRisco.id;
        this.loadProducts();
      },
      error: (error) => {
        console.error('Erro ao carregar perfil do usuário:', error);
        this.loadProducts(); // Load products anyway
      }
    });
  }

  loadProducts(): void {
    this.investmentService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.originalProducts = [...products];
        this.filteredProducts = [...products];
        this.loadRecommendedProducts();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.isLoading = false;
      }
    });
  }

  loadRecommendedProducts(): void {
    if (!this.userRiskProfileId) {
      this.recommendedProducts = [];
      return;
    }

    // Filter products based on user's risk profile ID
    this.recommendedProducts = this.allProducts
      .filter(product => product.riskProfileId === this.userRiskProfileId)
      .sort((a, b) => b.taxaAnual - a.taxaAnual)
      .slice(0, 3); // Show top 3 recommended products
  }

  filterByType(type: string): void {
    this.selectedType = type;
    
    if (type === 'Todos') {
      this.filteredProducts = [...this.originalProducts];
    } else {
      this.filteredProducts = this.originalProducts.filter(
        product => product.tipo === type
      );
    }
  }

  getRiskClass(risco: string): string {
    return risco.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  getRiskIcon(risco: string): string {
    const riskLower = risco.toLowerCase();
    if (riskLower.includes('baixo')) {
      return 'shield';
    } else if (riskLower.includes('medio') || riskLower.includes('médio')) {
      return 'balance';
    } else if (riskLower.includes('alto')) {
      return 'rocket_launch';
    }
    return 'show_chart';
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
