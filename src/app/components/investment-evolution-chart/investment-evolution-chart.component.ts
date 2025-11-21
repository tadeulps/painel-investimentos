import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Investment } from '../../models/investment.models';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-investment-evolution-chart',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './investment-evolution-chart.component.html',
  styleUrls: ['./investment-evolution-chart.component.scss'],
})
export class InvestmentEvolutionChartComponent
  implements AfterViewInit, OnChanges
{
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

    const chartData = this.generateEvolutionData();

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Valor Investido',
            data: chartData.valorInvestido,
            borderColor: '#005CA9',
            backgroundColor: 'rgba(0, 92, 169, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Valor Atual',
            data: chartData.valorAtual,
            borderColor: '#00A86B',
            backgroundColor: 'rgba(0, 168, 107, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                family: 'Lato',
                size: 12,
              },
              padding: 15,
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              family: 'Lato',
            },
            bodyFont: {
              size: 13,
              family: 'Lato',
            },
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(context.parsed.y);
                }
                return label;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(value as number);
              },
              font: {
                family: 'Lato',
                size: 11,
              },
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
          x: {
            ticks: {
              font: {
                family: 'Lato',
                size: 11,
              },
            },
            grid: {
              display: false,
            },
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  updateChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    this.createChart();
  }

  generateEvolutionData(): {
    labels: string[];
    valorInvestido: number[];
    valorAtual: number[];
  } {
    if (!this.investments || this.investments.length === 0) {
      return { labels: [], valorInvestido: [], valorAtual: [] };
    }

    const investments = this.investments.filter((inv) => inv.produto);
    const sortedInvestments = [...investments].sort(
      (a, b) =>
        new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
    );

    const labels: string[] = [];
    const valorInvestido: number[] = [];
    const valorAtual: number[] = [];

    const firstDate = new Date(sortedInvestments[0].dataInicio);
    const today = new Date();
    const currentMonthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    let currentDate = new Date(
      firstDate.getFullYear(),
      firstDate.getMonth(),
      1
    );

    while (currentDate <= today) {
      const label = currentDate.toLocaleDateString('pt-BR', {
        month: 'short',
        year: '2-digit',
      });

      const endOfCurrentMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const activeInvestments = sortedInvestments.filter(
        (inv) => new Date(inv.dataInicio) <= endOfCurrentMonth
      );

      const totalInvestido = activeInvestments.reduce(
        (sum, inv) => sum + inv.valor,
        0
      );

      const isCurrentMonth = currentDate >= currentMonthStart;

      const totalAtual = activeInvestments.reduce((sum, inv) => {
        if (isCurrentMonth) {
          return sum + (inv.valorAtual || inv.valor);
        }

        const monthsElapsed = this.getMonthsDifference(
          new Date(inv.dataInicio),
          currentDate
        );
        const taxaMensal =
          Math.pow(1 + (inv.produto?.taxaAnual ?? 0.08), 1 / 12) - 1;
        return (
          sum + inv.valor * Math.pow(1 + taxaMensal, Math.max(monthsElapsed, 0))
        );
      }, 0);

      labels.push(label);
      valorInvestido.push(Number(totalInvestido.toFixed(2)));
      valorAtual.push(Number(totalAtual.toFixed(2)));

      currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      );
    }
    return { labels, valorInvestido, valorAtual };
  }

  getMonthsDifference(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return (
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth())
    );
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
