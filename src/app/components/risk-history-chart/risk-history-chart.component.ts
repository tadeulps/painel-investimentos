import { Component, Input, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestmentService } from '../../services/investment.service';
import { PontuacaoHistoryEntry } from '../../models/investment.models';
import { AuthService } from '../../services/auth.service';
import { Chart, registerables } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';

Chart.register(...registerables);

@Component({
  selector: 'app-risk-history-chart',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './risk-history-chart.component.html',
  styleUrls: ['./risk-history-chart.component.scss']
})
export class RiskHistoryChartComponent implements OnInit, OnDestroy {
  historyData: PontuacaoHistoryEntry[] = [];
  @ViewChild('chartCanvas') chartCanvasRef!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | null = null;

  constructor(
    private investmentService: InvestmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPontuacaoHistory();
  }

  loadPontuacaoHistory(): void {
    const clientId = this.authService.getStoredClientId();
    if (!clientId) return;

    this.investmentService.getPontuacaoHistory(clientId).subscribe({
      next: (response) => {
        this.historyData = response.history;
        if (this.chartCanvasRef) {
          this.createChart();
        }
      },
      error: (error) => {
        console.error('Error loading pontuacao history:', error);
      }
    });
  }

  createChart(): void {
    if (!this.chartCanvasRef || this.historyData.length === 0) return;

    const ctx = this.chartCanvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.historyData.map(d => 
      new Date(d.timestamp).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: '2-digit'
      })
    );

    const config: any = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Pontuação de Risco',
            data: this.historyData.map(d => d.pontuacao),
            borderColor: '#005CA9',
            backgroundColor: 'rgba(0, 92, 169, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: this.historyData.map(d => this.getPontuacaoColor(d.pontuacao)),
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 15,
            titleFont: {
              size: 14,
              family: 'CAIXAStd',
              weight: 'bold'
            },
            bodyFont: {
              size: 13,
              family: 'CAIXAStd'
            },
            callbacks: {
              title: (context: any) => {
                return context[0].label;
              },
              label: (context: any) => {
                const dataPoint = this.historyData[context.dataIndex];
                return [
                  `Pontuação: ${dataPoint.pontuacao}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              font: {
                family: 'CAIXAStd',
                size: 11
              },
              stepSize: 10
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            title: {
              display: true,
              text: 'Pontuação',
              font: {
                family: 'CAIXAStd',
                size: 12,
                weight: 'bold'
              }
            }
          },
          x: {
            ticks: {
              font: {
                family: 'CAIXAStd',
                size: 11
              },
              maxRotation: 45,
              minRotation: 45
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  getPontuacaoColor(pontuacao: number): string {
    if (pontuacao <= 33) {
      return '#00A86B';
    }
    else if (pontuacao <= 66) {
      return '#FF9500';
    }
    else {
      return '#FF6B6B';
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
