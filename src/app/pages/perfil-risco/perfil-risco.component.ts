import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

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
  imports: [CommonModule],
  templateUrl: './perfil-risco.component.html',
  styleUrls: ['./perfil-risco.component.scss']
})
export class PerfilRiscoComponent implements OnInit {
  currentIndex = 1; // Start with Moderado in center
  selectedProfile: RiskProfile | null = null;
  userRiskProfileId: number | null = null;
  clienteId: number | null = null;
  isLoading = false;
  isSaving = false;

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

  selectProfile(index: number): void {
    this.currentIndex = index;
    this.selectedProfile = this.profiles[index];
  }

  previous(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.selectedProfile = this.profiles[this.currentIndex];
    }
  }

  next(): void {
    if (this.currentIndex < this.profiles.length - 1) {
      this.currentIndex++;
      this.selectedProfile = this.profiles[this.currentIndex];
    }
  }

  confirmSelection(): void {
    if (!this.selectedProfile || !this.clienteId) {
      return;
    }

    // Check if profile has changed
    if (this.selectedProfile.id === this.userRiskProfileId) {
      alert('Este já é o seu perfil atual.');
      return;
    }

    this.isSaving = true;

    this.authService.updateRiskProfile(this.clienteId, this.selectedProfile.id).subscribe({
      next: (response) => {
        this.userRiskProfileId = this.selectedProfile!.id;
        this.isSaving = false;
        alert(`Perfil "${this.selectedProfile!.title}" atualizado com sucesso!`);
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Erro ao atualizar perfil:', error);
        alert('Erro ao atualizar perfil. Tente novamente.');
      }
    });
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
        console.log(userProfile)
        // Set current index based on user's risk profile
        const profileIndex = this.profiles.findIndex(p => p.id === this.userRiskProfileId);
        if (profileIndex !== -1) {
          this.currentIndex = profileIndex;
          this.selectedProfile = this.profiles[profileIndex];
        } else {
          // Fallback to Moderado if not found
          this.currentIndex = 1;
          this.selectedProfile = this.profiles[1];
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar perfil do usuário:', error);
        // Fallback to default (Moderado)
        this.currentIndex = 1;
        this.selectedProfile = this.profiles[1];
        this.isLoading = false;
      }
    });
  }
}
