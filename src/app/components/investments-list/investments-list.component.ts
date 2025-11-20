import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Investment } from '../../services/investment.service';

@Component({
  selector: 'app-investments-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatChipsModule, MatIconModule],
  templateUrl: './investments-list.component.html',
  styleUrls: ['./investments-list.component.scss']
})
export class InvestmentsListComponent {
  @Input() investments: Investment[] = [];
  
  displayLimit = 5;
  showAll = false;

  get displayedInvestments(): Investment[] {
    return this.showAll ? this.investments : this.investments.slice(0, this.displayLimit);
  }

  get hasMore(): boolean {
    return this.investments.length > this.displayLimit;
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
  }

  calculateReturn(investment: Investment): number {
    return investment.valorAtual - investment.valor;
  }

  calculateReturnPercentage(investment: Investment): number {
    if (investment.valor === 0) return 0;
    return ((investment.valorAtual - investment.valor) / investment.valor) * 100;
  }

  getRiskClass(risk: string): string {
    const riskLower = risk.toLowerCase();
    if (riskLower.includes('baixo') || riskLower.includes('conservador')) {
      return 'low';
    } else if (riskLower.includes('médio') || riskLower.includes('moderado')) {
      return 'medium';
    } else if (riskLower.includes('alto') || riskLower.includes('agressivo')) {
      return 'high';
    }
    return 'medium';
  }

  getRiskIcon(risk: string): string {
    const riskLower = risk.toLowerCase();
    if (riskLower.includes('baixo') || riskLower.includes('conservador')) {
      return 'shield';
    } else if (riskLower.includes('médio') || riskLower.includes('moderado')) {
      return 'balance';
    } else if (riskLower.includes('alto') || riskLower.includes('agressivo')) {
      return 'rocket_launch';
    }
    return 'show_chart';
  }

  getMonthsRemaining(investment: Investment): number {
    const startDate = new Date(investment.dataInicio);
    const today = new Date();
    const monthsElapsed = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                         (today.getMonth() - startDate.getMonth());
    return Math.max(0, investment.prazoMeses - monthsElapsed);
  }
}
