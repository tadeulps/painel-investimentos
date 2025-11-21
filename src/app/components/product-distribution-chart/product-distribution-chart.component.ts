import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Investment } from '../../services/investment.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

interface ProductTypeData {
  type: string;
  value: number;
  count: number;
  color: string;
}

@Component({
  selector: 'app-product-distribution-chart',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './product-distribution-chart.component.html',
  styleUrls: ['./product-distribution-chart.component.scss']
})
export class ProductDistributionChartComponent implements AfterViewInit, OnChanges {
  @Input() investments: Investment[] = [];
  @ViewChild('chartCanvas') chartCanvasRef!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | null = null;

  // Color palette for different product types
  private colorPalette: { [key: string]: string } = {
    'Poupança': '#005CA9',
    'Renda Fixa': '#00A86B',
    'LCI': '#FF9500',
    'LCA': '#FF6B6B',
    'Tesouro Direto': '#4ECDC4',
    'Fundos': '#95E1D3',
    'Fundo Multimercado': '#F38181',
    'Ações': '#AA96DA',
    'default': '#6C757D'
  };

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

    const distributionData = this.calculateDistribution();

    const config: any = {
      type: 'doughnut',
      data: {
        labels: distributionData.map(d => d.type),
        datasets: [
          {
            label: 'Distribuição de Investimentos',
            data: distributionData.map(d => d.value),
            backgroundColor: distributionData.map(d => d.color),
            borderColor: '#FFFFFF',
            borderWidth: 2,
            hoverOffset: 15
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              font: {
                family: 'Lato',
                size: 12
              },
              padding: 15,
              usePointStyle: true,
              generateLabels: (chart: any) => {
                const data = chart.data;
                if (data.labels && data.datasets.length) {
                  return data.labels.map((label: string, i: number) => {
                    const value = data.datasets[0].data[i];
                    const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    const backgroundColor = distributionData[i]?.color || '#6C757D';

                    return {
                      text: `${label} (${percentage}%)`,
                      fillStyle: backgroundColor,
                      strokeStyle: '#FFFFFF',
                      lineWidth: 2,
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
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
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(2);
                
                const formattedValue = new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(value);

                const distributionData = this.calculateDistribution();
                const typeData = distributionData[context.dataIndex];
                const count = typeData?.count || 0;

                return [
                  `${label}`,
                  `Valor: ${formattedValue}`,
                  `Percentual: ${percentage}%`,
                  `Quantidade: ${count} investimento${count !== 1 ? 's' : ''}`
                ];
              }
            }
          }
        },
        cutout: '60%'
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

  calculateDistribution(): ProductTypeData[] {
    if (this.investments.length === 0) {
      return [];
    }

    // Group investments by product type
    const typeMap = new Map<string, { value: number; count: number }>();

    this.investments.forEach(inv => {
      const type = inv.produto?.tipo || 'Outros';
      const current = typeMap.get(type) || { value: 0, count: 0 };
      
      typeMap.set(type, {
        value: current.value + inv.valorAtual,
        count: current.count + 1
      });
    });

    // Convert to array and add colors
    const distribution: ProductTypeData[] = [];
    typeMap.forEach((data, type) => {
      distribution.push({
        type,
        value: data.value,
        count: data.count,
        color: this.colorPalette[type] || this.colorPalette['default']
      });
    });

    // Sort by value descending
    return distribution.sort((a, b) => b.value - a.value);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
