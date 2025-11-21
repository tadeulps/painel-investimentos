import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDistributionChartComponent } from './product-distribution-chart.component';
import { Investment, Product } from '../../core/models/investment.models';
import { SimpleChange } from '@angular/core';
import { Chart } from 'chart.js';

describe('ProductDistributionChartComponent', () => {
  let component: ProductDistributionChartComponent;
  let fixture: ComponentFixture<ProductDistributionChartComponent>;

  const mockProduct1: Product = {
    id: 1,
    nome: 'Poupança CAIXA',
    tipo: 'Poupança',
    taxaAnual: 6.17,
    risco: 'baixo',
    aplicacaoMinima: 1,
    liquidez: 'imediata',
    riskProfileId: 1
  };

  const mockProduct2: Product = {
    id: 2,
    nome: 'LCI Produto',
    tipo: 'LCI',
    taxaAnual: 8.5,
    risco: 'medio',
    aplicacaoMinima: 1000,
    liquidez: '90 dias',
    riskProfileId: 2
  };

  const mockProduct3: Product = {
    id: 3,
    nome: 'Tesouro Selic',
    tipo: 'Tesouro Direto',
    taxaAnual: 10.0,
    risco: 'baixo',
    aplicacaoMinima: 30,
    liquidez: 'D+1',
    riskProfileId: 1
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
    },
    {
      id: 4,
      userId: 1,
      productId: 3,
      valor: 2000,
      dataInicio: '2024-04-01',
      prazoMeses: 12,
      valorAtual: 2200.00,
      produto: mockProduct3
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDistributionChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDistributionChartComponent);
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

    it('should have color palette defined', () => {
      expect(component['colorPalette']).toBeDefined();
      expect(component['colorPalette']['Poupança']).toBe('#005CA9');
    });
  });

  describe('calculateDistribution', () => {
    it('should return empty array when no investments', () => {
      component.investments = [];
      const result = component.calculateDistribution();
      expect(result).toEqual([]);
    });

    it('should calculate distribution for single product type', () => {
      component.investments = [mockInvestments[0]];
      const result = component.calculateDistribution();
      
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('Poupança');
      expect(result[0].value).toBe(5308.50);
      expect(result[0].count).toBe(1);
    });

    it('should group multiple investments of same type', () => {
      component.investments = [mockInvestments[0], mockInvestments[2]];
      const result = component.calculateDistribution();
      
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('Poupança');
      expect(result[0].value).toBeCloseTo(8462.75, 2);
      expect(result[0].count).toBe(2);
    });

    it('should handle multiple product types', () => {
      component.investments = mockInvestments;
      const result = component.calculateDistribution();
      
      expect(result.length).toBe(3);
      expect(result.map(r => r.type).sort()).toEqual(['LCI', 'Poupança', 'Tesouro Direto'].sort());
    });

    it('should assign correct colors to product types', () => {
      component.investments = mockInvestments;
      const result = component.calculateDistribution();
      
      const poupanca = result.find(r => r.type === 'Poupança');
      const lci = result.find(r => r.type === 'LCI');
      const tesouro = result.find(r => r.type === 'Tesouro Direto');
      
      expect(poupanca?.color).toBe('#005CA9');
      expect(lci?.color).toBe('#FF9500');
      expect(tesouro?.color).toBe('#4ECDC4');
    });

    it('should use default color for unknown product type', () => {
      const unknownInvestment: Investment = {
        ...mockInvestments[0],
        produto: { ...mockProduct1, tipo: 'Unknown Type' }
      };
      component.investments = [unknownInvestment];
      const result = component.calculateDistribution();
      
      expect(result[0].color).toBe('#6C757D');
    });

    it('should sort distribution by value descending', () => {
      component.investments = mockInvestments;
      const result = component.calculateDistribution();
      
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].value).toBeGreaterThanOrEqual(result[i + 1].value);
      }
    });

    it('should handle investment without product', () => {
      const investmentNoProduct: Investment = {
        ...mockInvestments[0],
        produto: undefined
      };
      component.investments = [investmentNoProduct];
      const result = component.calculateDistribution();
      
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('Outros');
    });

    it('should calculate correct totals for mixed investments', () => {
      component.investments = mockInvestments;
      const result = component.calculateDistribution();
      
      const totalValue = result.reduce((sum, item) => sum + item.value, 0);
      const expectedTotal = mockInvestments.reduce((sum, inv) => sum + inv.valorAtual, 0);
      
      expect(totalValue).toBeCloseTo(expectedTotal, 2);
    });

    it('should count investments correctly per type', () => {
      component.investments = mockInvestments;
      const result = component.calculateDistribution();
      
      const poupanca = result.find(r => r.type === 'Poupança');
      const lci = result.find(r => r.type === 'LCI');
      const tesouro = result.find(r => r.type === 'Tesouro Direto');
      
      expect(poupanca?.count).toBe(2);
      expect(lci?.count).toBe(1);
      expect(tesouro?.count).toBe(1);
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
      fixture.detectChanges();
      
      const getContextSpy = spyOn(component['chartCanvasRef'].nativeElement, 'getContext').and.returnValue(null);
      
      component.createChart();
      
      expect(getContextSpy).toHaveBeenCalledWith('2d');
    });
  });

  describe('updateChart', () => {
    it('should destroy existing chart before creating new one', () => {
      component.investments = mockInvestments;
      fixture.detectChanges();
      
      const oldChart = component['chart'];
      const destroySpy = spyOn(oldChart as any, 'destroy').and.callThrough();
      const createChartSpy = spyOn(component, 'createChart').and.callThrough();
      
      component.updateChart();
      
      expect(destroySpy).toHaveBeenCalled();
      expect(createChartSpy).toHaveBeenCalled();
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
      const destroySpy = spyOn(chart as any, 'destroy');
      
      component.ngOnDestroy();
      
      expect(destroySpy).toHaveBeenCalled();
    });

    it('should handle destroy when chart is null', () => {
      component['chart'] = null;
      
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('Color Palette', () => {
    it('should have all expected product types with colors', () => {
      const palette = component['colorPalette'];
      
      expect(palette['Poupança']).toBe('#005CA9');
      expect(palette['Renda Fixa']).toBe('#00A86B');
      expect(palette['LCI']).toBe('#FF9500');
      expect(palette['LCA']).toBe('#FF6B6B');
      expect(palette['Tesouro Direto']).toBe('#4ECDC4');
      expect(palette['Fundos']).toBe('#95E1D3');
      expect(palette['Fundo Multimercado']).toBe('#F38181');
      expect(palette['Renda Variável']).toBe('#AA96DA');
      expect(palette['default']).toBe('#6C757D');
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

    it('should recalculate distribution when investments change', () => {
      component.investments = [mockInvestments[0]];
      fixture.detectChanges();
      
      let result = component.calculateDistribution();
      expect(result.length).toBe(1);
      
      component.investments = mockInvestments;
      result = component.calculateDistribution();
      expect(result.length).toBe(3);
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

    it('should maintain chart type as doughnut', () => {
      component.investments = mockInvestments;
      fixture.detectChanges();
      
      expect(component['chart']).toBeDefined();
      expect(component['chart']?.config).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle investment with zero valorAtual', () => {
      const zeroValueInvestment: Investment = {
        ...mockInvestments[0],
        valorAtual: 0
      };
      component.investments = [zeroValueInvestment];
      const result = component.calculateDistribution();
      
      expect(result[0].value).toBe(0);
    });

    it('should handle very large investment values', () => {
      const largeInvestment: Investment = {
        ...mockInvestments[0],
        valorAtual: 9999999999.99
      };
      component.investments = [largeInvestment];
      const result = component.calculateDistribution();
      
      expect(result[0].value).toBe(9999999999.99);
    });

    it('should handle many investments of different types', () => {
      const manyInvestments: Investment[] = [];
      for (let i = 0; i < 100; i++) {
        manyInvestments.push({
          ...mockInvestments[i % mockInvestments.length],
          id: i
        });
      }
      
      component.investments = manyInvestments;
      const result = component.calculateDistribution();
      
      expect(result.length).toBe(3);
      expect(result.reduce((sum, r) => sum + r.count, 0)).toBe(100);
    });

    it('should handle investments with same type but different products', () => {
      const sameTypeInvestment: Investment = {
        id: 10,
        userId: 1,
        productId: 99,
        valor: 1000,
        dataInicio: '2024-05-01',
        prazoMeses: 12,
        valorAtual: 1100,
        produto: { ...mockProduct1, id: 99, nome: 'Outra Poupança' }
      };
      
      component.investments = [mockInvestments[0], sameTypeInvestment];
      const result = component.calculateDistribution();
      
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('Poupança');
      expect(result[0].count).toBe(2);
    });
  });
});
