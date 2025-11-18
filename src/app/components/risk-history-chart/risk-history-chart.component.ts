import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Investment } from '../../services/investment.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface RiskHistoryPoint {
  date: string;
  riskLevel: number;
  productName: string;
  riskLabel: string;
}

@Component({
  selector: 'app-risk-history-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risk-history-chart.component.html',
  styleUrls: ['./risk-history-chart.component.scss']
})
export class RiskHistoryChartComponent implements AfterViewInit, OnChanges {
  @Input() investments: Investment[] = [];
  @ViewChild('chartCanvas') chartCanvasRef!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['investments'] && !changes['investments'].firstChange) {
      this.updateChart();
    }
  }

  createChart(): void {
    if (!this.chartCanvasRef || this.investments.length === 0) return;

    const ctx = this.chartCanvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const historyData = this.generateRiskHistory();

    const config: any = {
      type: 'line',
      data: {
        labels: historyData.map(d => d.date),
        datasets: [
          {
            label: 'Nível de Risco',
            data: historyData.map(d => d.riskLevel),
            borderColor: '#005CA9',
            backgroundColor: 'rgba(0, 92, 169, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: historyData.map(d => this.getRiskColor(d.riskLevel)),
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
              family: 'Lato',
              weight: 'bold'
            },
            bodyFont: {
              size: 13,
              family: 'Lato'
            },
            callbacks: {
              title: (context: any) => {
                return context[0].label;
              },
              label: (context: any) => {
                const dataPoint = historyData[context.dataIndex];
                return [
                  `Produto: ${dataPoint.productName}`,
                  `Risco: ${dataPoint.riskLabel}`,
                  `Nível: ${context.parsed.y}%`
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
              callback: (value: any) => `${value}%`,
              font: {
                family: 'Lato',
                size: 11
              },
              stepSize: 25
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              font: {
                family: 'Lato',
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

  updateChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    this.createChart();
  }

  generateRiskHistory(): RiskHistoryPoint[] {
    if (this.investments.length === 0) {
      return [];
    }

    // Sort investments by date
    const sortedInvestments = [...this.investments].sort(
      (a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
    );

    return sortedInvestments.map(inv => {
      const riskLabel = inv.produto?.risco || 'Médio';
      const riskLevel = this.getRiskLevel(riskLabel);
      const date = new Date(inv.dataInicio).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: '2-digit'
      });

      return {
        date,
        riskLevel,
        productName: inv.produto?.nome || 'Produto',
        riskLabel
      };
    });
  }

  getRiskLevel(riskLabel: string): number {
    const risk = riskLabel.toLowerCase();
    
    if (risk.includes('baixo') || risk.includes('conservador')) {
      return 25;
    } else if (risk.includes('médio') || risk.includes('moderado')) {
      return 50;
    } else if (risk.includes('alto') || risk.includes('agressivo')) {
      return 75;
    }
    
    return 50; // Default to medium
  }

  getRiskColor(riskLevel: number): string {
    if (riskLevel <= 25) {
      return '#00A86B'; // Green for low risk
    } else if (riskLevel <= 50) {
      return '#FF9500'; // Orange for medium risk
    } else {
      return '#FF6B6B'; // Red for high risk
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
