import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface RiskProfile {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  riskLevel: number;
  features: string[];
}

@Component({
  selector: 'app-perfil-risco',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './perfil-risco.component.html',
  styleUrls: ['./perfil-risco.component.scss']
})
export class PerfilRiscoComponent implements OnInit {
  currentIndex = 1; // Start with Moderado in center
  selectedProfile: RiskProfile | null = null;
  userRiskProfileId: number | null = null;
  clienteId: number | null = null;
  isLoading = false;
  userPontuacao: number = 0;
  userName: string = '';

  profiles: RiskProfile[] = [
    {
      id: 1,
      title: 'Conservador',
      description: 'Perfil focado em segurança e preservação de capital, com baixa tolerância a riscos.',
      icon: '🛡️',
      color: 'linear-gradient(135deg, #127527, #179231)',
      riskLevel: 2,
      features: [
        'Prioriza segurança do capital',
        'Aceita retornos menores',
        'Ideal para objetivos de curto prazo',
        'CDB, Tesouro Selic, LCI/LCA'
      ]
    },
    {
      id: 2,
      title: 'Moderado',
      description: 'Perfil equilibrado entre segurança e rentabilidade, com tolerância moderada a riscos.',
      icon: '⚖️',
      color: 'linear-gradient(135deg, #FCBE05, #CA9804)',
      riskLevel: 3,
      features: [
        'Equilibra segurança e rentabilidade',
        'Diversificação recomendada',
        'Ideal para médio prazo',
        'Fundos Multimercado, Tesouro IPCA+'
      ]
    },
    {
      id: 3,
      title: 'Agressivo',
      description: 'Perfil voltado para alta rentabilidade, com maior tolerância a riscos e volatilidade.',
      icon: '🚀',
      color: 'linear-gradient(135deg, #D93636, #B22C2C)',
      riskLevel: 5,
      features: [
        'Busca alta rentabilidade',
        'Alta tolerância a volatilidade',
        'Ideal para longo prazo',
        'Ações, Fundos de Ações, ETFs'
      ]
    }
  ];

  constructor(private authService: AuthService) {}

  getRiskCategory(): string {
    if (this.userPontuacao <= 33) return 'Conservador';
    if (this.userPontuacao <= 66) return 'Moderado';
    return 'Agressivo';
  }

  getRiskColor(): string {
    if (this.userPontuacao <= 33) return '#179231';
    if (this.userPontuacao <= 66) return '#FCBE05';
    return '#D93636';
  }

  getRiskIcon(): string {
    if (this.userPontuacao <= 33) return '🛡️';
    if (this.userPontuacao <= 66) return '⚖️';
    return '🚀';
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.clienteId = this.authService.getStoredClientId();

    if (!this.clienteId) {
      console.error('Cliente ID não encontrado');
      this.isLoading = false;
      return;
    }
    // Load user profile from API
    this.authService.getUserProfile(this.clienteId).subscribe({
      next: (userProfile) => {
        this.userRiskProfileId = userProfile.perfilRisco.id;
        this.userPontuacao = userProfile.pontuacao || 50;
        this.userName = userProfile.nome;
        console.log('User profile loaded:', userProfile);
        
        // Set current index based on pontuacao
        if (this.userPontuacao <= 33) {
          this.currentIndex = 0; // Conservador
        } else if (this.userPontuacao <= 66) {
          this.currentIndex = 1; // Moderado
        } else {
          this.currentIndex = 2; // Agressivo
        }
        
        this.selectedProfile = this.profiles[this.currentIndex];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar perfil do usuário:', error);
        // Fallback to default
        this.userPontuacao = 50;
        this.currentIndex = 1;
        this.selectedProfile = this.profiles[1];
        this.isLoading = false;
      }
    });
  }
}
