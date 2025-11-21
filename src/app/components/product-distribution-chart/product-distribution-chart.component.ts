import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Investment } from '../../core/models/investment.models';
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

 private colorPalette: { [key: string]: string } = {
  'Poupança': '#0072CE',
  'Renda Fixa': '#009788',
  'LCI': '#FFA94D',
  'LCA': '#8ED1C7',
  'Tesouro Direto': '#4DD4C6',
  'Fundos': '#FF7A7A',
  'Fundo Multimercado': '#F5A5A5',
  'Renda Variável': '#B9A2E8',
  'default': '#7A7A7A'
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
                family: 'CaixaStd', 
                size: 13
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
              family: 'CaixaStd',
              weight: 'bold'
            },
            bodyFont: {
              size: 13,
              family: 'CaixaStd'
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

    const typeMap = new Map<string, { value: number; count: number }>();

    this.investments.forEach(inv => {
      const type = inv.produto?.tipo || 'Outros';
      const current = typeMap.get(type) || { value: 0, count: 0 };
      
      typeMap.set(type, {
        value: current.value + inv.valorAtual,
        count: current.count + 1
      });
    });

    const distribution: ProductTypeData[] = [];
    typeMap.forEach((data, type) => {
      distribution.push({
        type,
        value: data.value,
        count: data.count,
        color: this.colorPalette[type] || this.colorPalette['default']
      });
    });

    return distribution.sort((a, b) => b.value - a.value);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
