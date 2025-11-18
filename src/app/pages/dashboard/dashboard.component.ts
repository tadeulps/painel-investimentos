import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InvestmentService, Investment } from '../../services/investment.service';
import { InvestmentEvolutionChartComponent } from '../../components/investment-evolution-chart/investment-evolution-chart.component';
import { ProductDistributionChartComponent } from '../../components/product-distribution-chart/product-distribution-chart.component';
import { RiskHistoryChartComponent } from '../../components/risk-history-chart/risk-history-chart.component';

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

interface DashboardSummary {
  valorTotalInvestido: number;
  rentabilidadeAcumulada: number;
  numeroInvestimentos: number;
  valorAtualTotal: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, InvestmentEvolutionChartComponent, ProductDistributionChartComponent, RiskHistoryChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userProfile: UserProfile | null = null;
  investments: Investment[] = [];
  summary: DashboardSummary = {
    valorTotalInvestido: 0,
    rentabilidadeAcumulada: 0,
    numeroInvestimentos: 0,
    valorAtualTotal: 0
  };
  isLoading = false;
  clienteId: number | null = null;

  constructor(
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

    // Load user profile
    this.authService.getUserProfile(this.clienteId).subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.loadInvestments();
      },
      error: (error) => {
        console.error('Erro ao carregar perfil:', error);
        this.isLoading = false;
      }
    });
  }

  loadInvestments(): void {
    if (!this.clienteId) return;

    this.investmentService.getUserInvestments(this.clienteId).subscribe({
      next: (investments) => {
        this.investments = investments;
        this.calculateSummary();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar investimentos:', error);
        this.isLoading = false;
      }
    });
  }

  calculateSummary(): void {
    this.summary.numeroInvestimentos = this.investments.length;
    this.summary.valorTotalInvestido = this.investments.reduce(
      (total, inv) => total + inv.valor, 
      0
    );
    this.summary.valorAtualTotal = this.investments.reduce(
      (total, inv) => total + inv.valorAtual, 
      0
    );
    this.summary.rentabilidadeAcumulada = 
      this.summary.valorAtualTotal - this.summary.valorTotalInvestido;
  }

  getRiskProfileClass(): string {
    if (!this.userProfile) return '';
    
    const profileName = this.userProfile.perfilRisco.name.toLowerCase();
    
    if (profileName.includes('conservador')) return 'conservador';
    if (profileName.includes('moderado')) return 'moderado';
    if (profileName.includes('agressivo')) return 'agressivo';
    
    return '';
  }

  getRiskProfileIcon(): string {
    if (!this.userProfile) return '📊';
    
    const profileName = this.userProfile.perfilRisco.name.toLowerCase();
    
    if (profileName.includes('conservador')) return '🛡️';
    if (profileName.includes('moderado')) return '⚖️';
    if (profileName.includes('agressivo')) return '🚀';
    
    return '📊';
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }
}
