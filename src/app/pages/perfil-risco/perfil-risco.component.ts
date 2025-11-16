import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RiskProfile {
  id: string;
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
export class PerfilRiscoComponent {
  currentIndex = 1; // Start with Moderado in center
  selectedProfile: RiskProfile | null = null;

  profiles: RiskProfile[] = [
    {
      id: 'conservador',
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
      id: 'moderado',
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
      id: 'agressivo',
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
    if (this.selectedProfile) {
      console.log('Perfil selecionado:', this.selectedProfile);
      // TODO: Implement API call to save profile
      alert(`Perfil "${this.selectedProfile.title}" selecionado com sucesso!`);
    }
  }

  ngOnInit(): void {
    // Set initial selected profile (Moderado)
    this.selectedProfile = this.profiles[this.currentIndex];
  }
}
