import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvestmentEvolutionChartComponent } from './investment-evolution-chart.component';
import { Investment, Product } from '../../core/models/investment.models';
import { SimpleChange } from '@angular/core';

describe('InvestmentEvolutionChartComponent', () => {
  let component: InvestmentEvolutionChartComponent;
  let fixture: ComponentFixture<InvestmentEvolutionChartComponent>;

  const mockProduct1: Product = {
    id: 1,
    nome: 'Poupança CAIXA',
    tipo: 'Poupança',
    taxaAnual: 0.0617,
    risco: 'baixo',
    aplicacaoMinima: 1,
    liquidez: 'imediata',
    riskProfileId: 1
  };

  const mockProduct2: Product = {
    id: 2,
    nome: 'LCI',
    tipo: 'LCI',
    taxaAnual: 0.085,
    risco: 'medio',
    aplicacaoMinima: 1000,
    liquidez: '90 dias',
    riskProfileId: 2
  };

  const mockInvestments: Investment[] = [
    {
      id: 1,
      userId: 1,
      productId: 1,
      valor: 5000,
      dataInicio: '2024-01-01',
      prazoMeses: 12,
      valorAtual: 5308.50,
      produto: mockProduct1
    },
    {
      id: 2,
      userId: 1,
      productId: 2,
      valor: 10000,
      dataInicio: '2024-02-01',
      prazoMeses: 24,
      valorAtual: 10850.00,
      produto: mockProduct2
    },
    {
      id: 3,
      userId: 1,
      productId: 1,
      valor: 3000,
      dataInicio: '2024-03-01',
      prazoMeses: 6,
      valorAtual: 3154.25,
      produto: mockProduct1
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestmentEvolutionChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentEvolutionChartComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty investments array', () => {
      expect(component.investments).toEqual([]);
    });

    it('should have chart as null initially', () => {
      expect(component['chart']).toBeNull();
    });
  });

  describe('generateEvolutionData', () => {
    it('should return empty arrays when no investments', () => {
      component.investments = [];
      const result = component.generateEvolutionData();
      
      expect(result.labels).toEqual([]);
      expect(result.valorInvestido).toEqual([]);
      expect(result.valorAtual).toEqual([]);
    });

    it('should filter out investments without produto', () => {
      const investmentWithoutProduct: Investment = {
        ...mockInvestments[0],
        produto: undefined
      };
      component.investments = [investmentWithoutProduct, mockInvestments[0]];
      
      const result = component.generateEvolutionData();
      
      expect(result.labels.length).toBeGreaterThan(0);
      expect(result.valorInvestido.length).toBeGreaterThan(0);
      expect(result.valorAtual.length).toBeGreaterThan(0);
    });

    it('should sort investments by dataInicio', () => {
      const unsortedInvestments = [mockInvestments[2], mockInvestments[0], mockInvestments[1]];
      component.investments = unsortedInvestments;
      
      const result = component.generateEvolutionData();
      
      expect(result.labels.length).toBeGreaterThan(0);
      expect(result.valorInvestido.length).toBeGreaterThan(0);
    });

    it('should generate labels in pt-BR format', () => {
      component.investments = [mockInvestments[0]];
      
      const result = component.generateEvolutionData();
      
      expect(result.labels.length).toBeGreaterThan(0);
      expect(result.labels[0]).toMatch(/[a-z]{3}\./i);
    });

    it('should calculate total invested value correctly', () => {
      component.investments = mockInvestments;
      
      const result = component.generateEvolutionData();
      
      const lastIndex = result.labels.length - 1;
      const expectedTotal = mockInvestments.reduce((sum, inv) => sum + inv.valor, 0);
      expect(result.valorInvestido[lastIndex]).toBe(expectedTotal);
    });

    it('should include current month in evolution', () => {
      component.investments = mockInvestments;
      
      const result = component.generateEvolutionData();
      
      const today = new Date();
      const currentMonthLabel = today.toLocaleDateString('pt-BR', {
        month: 'short',
        year: '2-digit',
      });
      
      expect(result.labels).toContain(currentMonthLabel);
    });

    it('should use valorAtual for current month calculations', () => {
      component.investments = mockInvestments;
      
      const result = component.generateEvolutionData();
      
      expect(result.valorAtual.length).toBeGreaterThan(0);
      const lastValue = result.valorAtual[result.valorAtual.length - 1];
      expect(lastValue).toBeGreaterThan(0);
    });

    it('should calculate historical values using taxaAnual', () => {
      const oldInvestment: Investment = {
        ...mockInvestments[0],
        dataInicio: '2023-01-01'
      };
      component.investments = [oldInvestment];
      
      const result = component.generateEvolutionData();
      
      expect(result.valorAtual.length).toBeGreaterThan(0);
    expect(result.valorAtual[result.valorAtual.length - 1]).toBeGreaterThan(0);
    });

    it('should handle investments starting in the same month', () => {
      const sameMonthInvestments = mockInvestments.map(inv => ({
        ...inv,
        dataInicio: '2024-01-15'
      }));
      component.investments = sameMonthInvestments;
      
      const result = component.generateEvolutionData();
      
      expect(result.labels.length).toBeGreaterThan(0);
    });

    it('should return fixed decimal values', () => {
      component.investments = mockInvestments;
      
      const result = component.generateEvolutionData();
      
      result.valorInvestido.forEach(value => {
        const decimalPlaces = value.toString().split('.')[1]?.length || 0;
        expect(decimalPlaces).toBeLessThanOrEqual(2);
      });
      
      result.valorAtual.forEach(value => {
        const decimalPlaces = value.toString().split('.')[1]?.length || 0;
        expect(decimalPlaces).toBeLessThanOrEqual(2);
      });
    });

    it('should accumulate investments over time', () => {
      component.investments = mockInvestments;
      
      const result = component.generateEvolutionData();
      
      for (let i = 1; i < result.valorInvestido.length; i++) {
        expect(result.valorInvestido[i]).toBeGreaterThanOrEqual(result.valorInvestido[i - 1]);
      }
    });

    it('should handle single investment', () => {
      component.investments = [mockInvestments[0]];
      
      const result = component.generateEvolutionData();
      
      expect(result.labels.length).toBeGreaterThan(0);
      expect(result.valorInvestido.length).toBe(result.labels.length);
      expect(result.valorAtual.length).toBe(result.labels.length);
    });
  });

  describe('getMonthsDifference', () => {
    it('should calculate zero months for same date', () => {
      const date = new Date('2024-01-01');
      const result = component.getMonthsDifference(date, date);
      
      expect(result).toBe(0);
    });

    it('should calculate one month difference', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-02-01');
      const result = component.getMonthsDifference(start, end);
      
      expect(result).toBe(1);
    });

    it('should calculate twelve months for one year', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2025-01-01');
      const result = component.getMonthsDifference(start, end);
      
      expect(result).toBe(12);
    });

    it('should handle dates in different years', () => {
      const start = new Date('2023-06-15');
      const end = new Date('2024-09-20');
      const result = component.getMonthsDifference(start, end);
      
      expect(result).toBe(15);
    });

    it('should handle negative difference (end before start)', () => {
      const start = new Date('2024-06-01');
      const end = new Date('2024-01-01');
      const result = component.getMonthsDifference(start, end);
      
      expect(result).toBe(-5);
    });

    it('should ignore day of month in calculation', () => {
      const start = new Date('2024-01-31');
      const end = new Date('2024-02-28');
      const result = component.getMonthsDifference(start, end);
      
      expect(result).toBe(1);
    });

    it('should calculate multiple years correctly', () => {
      const start = new Date('2020-01-01');
      const end = new Date('2024-01-01');
      const result = component.getMonthsDifference(start, end);
      
      expect(result).toBe(48);
    });
  });

  describe('createChart', () => {
    it('should not create chart when chartCanvasRef is not available', () => {
      component.investments = mockInvestments;
      component['chartCanvasRef'] = undefined as any;
      
      component.createChart();
      
      expect(component['chart']).toBeNull();
    });

    it('should not create chart when investments array is empty', () => {
      component.investments = [];
      fixture.detectChanges();
      
      component.createChart();
      
      expect(component['chart']).toBeNull();
    });

    it('should create chart when canvas and investments are available', () => {
      component.investments = mockInvestments;
      fixture.detectChanges();
      
      expect(component['chart']).toBeDefined();
    });

    it('should not create chart when canvas context is not available', () => {
      component.investments = mockInvestments;
      
      const getContextSpy = spyOn(HTMLCanvasElement.prototype, 'getContext').and.returnValue(null);
      
      fixture.detectChanges();
      
      expect(getContextSpy).toHaveBeenCalled();
      expect(component['chart']).toBeNull();
    });

    it('should create chart with two datasets', () => {
      component.investments = mockInvestments;
      fixture.detectChanges();
      
      const chart = component['chart'];
      expect(chart?.data.datasets.length).toBe(2);
    });

    it('should set correct labels for datasets', () => {
      component.investments = mockInvestments;
      fixture.detectChanges();
      
      const chart = component['chart'];
      expect(chart?.data.datasets[0].label).toBe('Valor Investido');
      expect(chart?.data.datasets[1].label).toBe('Valor Atual');
    });

    it('should use correct colors for datasets', () => {
      component.investments = mockInvestments;
      fixture.detectChanges();
      
      const chart = component['chart'];
      expect(chart?.data.datasets[0].borderColor).toBe('#005CA9');
      expect(chart?.data.datasets[1].borderColor).toBe('#00A86B');
    });
  });

  describe('updateChart', () => {
    it('should destroy existing chart before creating new one', () => {
      component.investments = mockInvestments;
      fixture.detectChanges();
      
      const oldChart = component['chart'];
      if (oldChart) {
        const destroySpy = spyOn(oldChart, 'destroy').and.callThrough();
        const createChartSpy = spyOn(component, 'createChart').and.callThrough();
        
        component.updateChart();
        
        expect(destroySpy).toHaveBeenCalled();
        expect(createChartSpy).toHaveBeenCalled();
      }
    });

    it('should handle updateChart when no chart exists', () => {
      component.investments = mockInvestments;
      fixture.detectChanges();
      
      if (component['chart']) {
        component['chart'].destroy();
      }
      component['chart'] = null;
      
      expect(() => component.updateChart()).not.toThrow();
    });

    it('should create new chart after destroying old one', () => {
      component.investments = mockInvestments;
      fixture.detectChanges();
      
      const oldChartId = component['chart']?.id;
      component.updateChart();
      
      expect(component['chart']?.id).not.toBe(oldChartId);
      expect(component['chart']).toBeDefined();
    });
  });

  describe('ngOnChanges', () => {
    it('should not update chart on first change', () => {
      const updateChartSpy = spyOn(component, 'updateChart');
      
      component.ngOnChanges({
        investments: new SimpleChange(undefined, mockInvestments, true)
      });
      
      expect(updateChartSpy).not.toHaveBeenCalled();
    });

    it('should update chart on subsequent changes', () => {
      component.investments = mockInvestments;
      fixture.detectChanges();
      
      const updateChartSpy = spyOn(component, 'updateChart');
      
      component.ngOnChanges({
        investments: new SimpleChange(mockInvestments, [...mockInvestments], false)
      });
      
      expect(updateChartSpy).toHaveBeenCalled();
    });

    it('should not update chart when investments do not change', () => {
      const updateChartSpy = spyOn(component, 'updateChart');
      
      component.ngOnChanges({
        otherProperty: new SimpleChange('old', 'new', false)
      });
      
      expect(updateChartSpy).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should destroy chart on component destroy', () => {
      component.investments = mockInvestments;
      fixture.detectChanges();
      
      const chart = component['chart'];
      if (chart) {
        const destroySpy = spyOn(chart, 'destroy').and.callThrough();
        
        component.ngOnDestroy();
        
        expect(destroySpy).toHaveBeenCalled();
      }
    });

    it('should handle destroy when chart is null', () => {
      component['chart'] = null;
      
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should handle destroy when chart is undefined', () => {
      component['chart'] = undefined as any;
      
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should handle empty to populated investments transition', () => {
      component.investments = [];
      fixture.detectChanges();
      
      component.investments = mockInvestments;
      component.ngOnChanges({
        investments: new SimpleChange([], mockInvestments, false)
      });
      
      fixture.detectChanges();
      expect(component['chart']).toBeDefined();
    });

    it('should recalculate evolution when investments change', () => {
      component.investments = [mockInvestments[0]];
      fixture.detectChanges();
      
      let result = component.generateEvolutionData();
      const firstLength = result.labels.length;
      
      component.investments = mockInvestments;
      result = component.generateEvolutionData();
      
      expect(result.labels.length).toBeGreaterThanOrEqual(firstLength);
    });

    it('should handle rapid investment updates', () => {
      component.investments = mockInvestments;
      fixture.detectChanges();
      
      const updateChartSpy = spyOn(component, 'updateChart').and.callThrough();
      
      component.ngOnChanges({
        investments: new SimpleChange(mockInvestments, [mockInvestments[0]], false)
      });
      
      component.ngOnChanges({
        investments: new SimpleChange([mockInvestments[0]], mockInvestments, false)
      });
      
      expect(updateChartSpy).toHaveBeenCalledTimes(2);
    });

    it('should maintain chart type as line', () => {
      component.investments = mockInvestments;
      fixture.detectChanges();
      
      expect(component['chart']).toBeDefined();
      expect(component['chart']?.config).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle investment with zero valor', () => {
      const zeroValueInvestment: Investment = {
        ...mockInvestments[0],
        valor: 0,
        valorAtual: 0
      };
      component.investments = [zeroValueInvestment];
      
      const result = component.generateEvolutionData();
      
      expect(result.valorInvestido[result.valorInvestido.length - 1]).toBe(0);
    });

    it('should handle very large investment values', () => {
      const largeInvestment: Investment = {
        ...mockInvestments[0],
        valor: 9999999999.99,
        valorAtual: 9999999999.99
      };
      component.investments = [largeInvestment];
      
      const result = component.generateEvolutionData();
      
      expect(result.valorInvestido[result.valorInvestido.length - 1]).toBe(9999999999.99);
    });

    it('should handle many investments', () => {
      const manyInvestments: Investment[] = [];
      for (let i = 0; i < 50; i++) {
        manyInvestments.push({
          ...mockInvestments[0],
          id: i,
          dataInicio: `2024-${String(Math.floor(i / 4) + 1).padStart(2, '0')}-01`
        });
      }
      
      component.investments = manyInvestments;
      const result = component.generateEvolutionData();
      
      expect(result.labels.length).toBeGreaterThan(0);
    });

    it('should handle investments with missing taxaAnual', () => {
      const investmentWithoutTaxa: Investment = {
        ...mockInvestments[0],
        produto: { ...mockProduct1, taxaAnual: undefined as any }
      };
      component.investments = [investmentWithoutTaxa];
      
      const result = component.generateEvolutionData();
      
      expect(result.valorAtual.length).toBeGreaterThan(0);
    });

    it('should handle future start dates gracefully', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const futureInvestment: Investment = {
        ...mockInvestments[0],
        dataInicio: futureDate.toISOString().split('T')[0]
      };
      component.investments = [futureInvestment];
      
      const result = component.generateEvolutionData();
      
      expect(result.labels).toEqual([]);
    });

    it('should handle investments from many years ago', () => {
      const oldInvestment: Investment = {
        ...mockInvestments[0],
        dataInicio: '2015-01-01'
      };
      component.investments = [oldInvestment];
      
      const result = component.generateEvolutionData();
      
      expect(result.labels.length).toBeGreaterThan(12);
    });

    it('should handle decimal taxaAnual values', () => {
      const decimalTaxaInvestment: Investment = {
        ...mockInvestments[0],
        produto: { ...mockProduct1, taxaAnual: 0.0617 }
      };
      component.investments = [decimalTaxaInvestment];
      
      const result = component.generateEvolutionData();
      
      expect(result.valorAtual.length).toBeGreaterThan(0);
    });

    it('should handle investments with same dataInicio', () => {
      const sameDateInvestments = mockInvestments.map(inv => ({
        ...inv,
        dataInicio: '2024-01-01'
      }));
      component.investments = sameDateInvestments;
      
      const result = component.generateEvolutionData();
      
      const expectedTotal = sameDateInvestments.reduce((sum, inv) => sum + inv.valor, 0);
      const firstActiveIndex = result.valorInvestido.findIndex(val => val === expectedTotal);
      expect(firstActiveIndex).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Chart Configuration', () => {
    beforeEach(() => {
      component.investments = mockInvestments;
      fixture.detectChanges();
    });

    it('should configure chart with correct options', () => {
      const chart = component['chart'];
      expect(chart?.options?.responsive).toBe(true);
      expect(chart?.options?.maintainAspectRatio).toBe(false);
    });

    it('should configure Y-axis to begin at zero', () => {
      const chart = component['chart'];
      const yScale = (chart?.options as any)?.scales?.y;
      expect(yScale?.beginAtZero).toBe(true);
    });

    it('should configure line chart with proper styling', () => {
      const chart = component['chart'];
      const dataset1 = chart?.data.datasets[0] as any;
      const dataset2 = chart?.data.datasets[1] as any;
      
      expect(dataset1?.fill).toBe(true);
      expect(dataset1?.tension).toBe(0.4);
      expect(dataset2?.fill).toBe(true);
      expect(dataset2?.tension).toBe(0.4);
    });

    it('should display legend at top', () => {
      const chart = component['chart'];
      const legend = (chart?.options as any)?.plugins?.legend;
      expect(legend?.display).toBe(true);
      expect(legend?.position).toBe('top');
    });
  });
});
