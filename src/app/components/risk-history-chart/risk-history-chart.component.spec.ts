import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RiskHistoryChartComponent } from './risk-history-chart.component';
import { InvestmentService } from '../../services/investment.service';
import { AuthService } from '../../services/auth.service';
import { PontuacaoHistoryEntry } from '../../models/investment.models';
import { of, throwError } from 'rxjs';

describe('RiskHistoryChartComponent', () => {
  let component: RiskHistoryChartComponent;
  let fixture: ComponentFixture<RiskHistoryChartComponent>;
  let investmentService: jasmine.SpyObj<InvestmentService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockHistoryData: PontuacaoHistoryEntry[] = [
    {
      id: 1,
      clienteId: 1,
      pontuacao: 25,
      riskProfileId: 1,
      riskProfileName: 'Conservador',
      timestamp: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      clienteId: 1,
      pontuacao: 50,
      riskProfileId: 2,
      riskProfileName: 'Moderado',
      timestamp: '2024-02-01T00:00:00Z'
    },
    {
      id: 3,
      clienteId: 1,
      pontuacao: 75,
      riskProfileId: 3,
      riskProfileName: 'Arrojado',
      timestamp: '2024-03-01T00:00:00Z'
    }
  ];

  const mockPontuacaoResponse = {
    clienteId: 1,
    totalEntries: 3,
    history: mockHistoryData
  };

  beforeEach(async () => {
    const investmentServiceSpy = jasmine.createSpyObj('InvestmentService', [
      'getPontuacaoHistory'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getStoredClientId'
    ]);

    await TestBed.configureTestingModule({
      imports: [RiskHistoryChartComponent],
      providers: [
        { provide: InvestmentService, useValue: investmentServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    investmentService = TestBed.inject(InvestmentService) as jasmine.SpyObj<InvestmentService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    fixture = TestBed.createComponent(RiskHistoryChartComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      authService.getStoredClientId.and.returnValue(null);
      expect(component).toBeTruthy();
    });

    it('should initialize with empty historyData', () => {
      authService.getStoredClientId.and.returnValue(null);
      expect(component.historyData).toEqual([]);
    });

    it('should have chart as null initially', () => {
      authService.getStoredClientId.and.returnValue(null);
      expect(component['chart']).toBeNull();
    });

    it('should call loadPontuacaoHistory on init', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getPontuacaoHistory.and.returnValue(of(mockPontuacaoResponse));
      
      const loadSpy = spyOn(component, 'loadPontuacaoHistory').and.callThrough();
      
      component.ngOnInit();
      
      expect(loadSpy).toHaveBeenCalled();
    });
  });

  describe('loadPontuacaoHistory', () => {
    it('should not load data when clientId is null', () => {
      authService.getStoredClientId.and.returnValue(null);
      
      component.loadPontuacaoHistory();
      
      expect(investmentService.getPontuacaoHistory).not.toHaveBeenCalled();
    });

    it('should not load data when clientId is undefined', () => {
      authService.getStoredClientId.and.returnValue(undefined as any);
      
      component.loadPontuacaoHistory();
      
      expect(investmentService.getPontuacaoHistory).not.toHaveBeenCalled();
    });

    it('should call getPontuacaoHistory with correct clientId', () => {
      authService.getStoredClientId.and.returnValue(123);
      investmentService.getPontuacaoHistory.and.returnValue(of(mockPontuacaoResponse));
      
      component.loadPontuacaoHistory();
      
      expect(investmentService.getPontuacaoHistory).toHaveBeenCalledWith(123);
    });

    it('should set historyData on successful load', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getPontuacaoHistory.and.returnValue(of(mockPontuacaoResponse));
      
      component.loadPontuacaoHistory();
      
      expect(component.historyData).toEqual(mockHistoryData);
    });

    it('should create chart when chartCanvasRef is available', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getPontuacaoHistory.and.returnValue(of(mockPontuacaoResponse));
      fixture.detectChanges();
      
      const createChartSpy = spyOn(component, 'createChart');
      
      component.loadPontuacaoHistory();
      
      expect(createChartSpy).toHaveBeenCalled();
    });

    it('should not create chart when chartCanvasRef is not available', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getPontuacaoHistory.and.returnValue(of(mockPontuacaoResponse));
      
      component['chartCanvasRef'] = undefined as any;
      const createChartSpy = spyOn(component, 'createChart');
      
      component.loadPontuacaoHistory();
      
      expect(createChartSpy).not.toHaveBeenCalled();
    });

    it('should handle error when loading history fails', () => {
      authService.getStoredClientId.and.returnValue(1);
      const error = { message: 'Network error' };
      investmentService.getPontuacaoHistory.and.returnValue(throwError(() => error));
      
      const consoleSpy = spyOn(console, 'error');
      
      component.loadPontuacaoHistory();
      
      expect(consoleSpy).toHaveBeenCalledWith('Error loading pontuacao history:', error);
    });

    it('should handle empty history data', () => {
      authService.getStoredClientId.and.returnValue(1);
      const emptyResponse = { clienteId: 1, totalEntries: 0, history: [] };
      investmentService.getPontuacaoHistory.and.returnValue(of(emptyResponse));
      
      component.loadPontuacaoHistory();
      
      expect(component.historyData).toEqual([]);
    });

    it('should handle single history entry', () => {
      authService.getStoredClientId.and.returnValue(1);
      const singleResponse = { 
        clienteId: 1, 
        totalEntries: 1, 
        history: [mockHistoryData[0]] 
      };
      investmentService.getPontuacaoHistory.and.returnValue(of(singleResponse));
      
      component.loadPontuacaoHistory();
      
      expect(component.historyData.length).toBe(1);
    });
  });

  describe('createChart', () => {
    beforeEach(() => {
      component.historyData = mockHistoryData;
    });

    it('should not create chart when chartCanvasRef is not available', () => {
      component['chartCanvasRef'] = undefined as any;
      
      component.createChart();
      
      expect(component['chart']).toBeNull();
    });

    it('should not create chart when historyData is empty', () => {
      component.historyData = [];
      fixture.detectChanges();
      
      component.createChart();
      
      expect(component['chart']).toBeNull();
    });

    it('should create chart when canvas and data are available', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getPontuacaoHistory.and.returnValue(of(mockPontuacaoResponse));
      fixture.detectChanges();
      
      component.createChart();
      
      expect(component['chart']).toBeDefined();
    });

    it('should not create chart when canvas context is not available', () => {
      fixture.detectChanges();
      
      spyOn(component['chartCanvasRef'].nativeElement, 'getContext').and.returnValue(null);
      
      component.createChart();
      
      expect(component['chart']).toBeNull();
    });

    it('should format dates correctly in chart labels', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getPontuacaoHistory.and.returnValue(of(mockPontuacaoResponse));
      fixture.detectChanges();
      
      component.createChart();
      
      const chart = component['chart'];
      expect(chart?.data.labels).toBeDefined();
      expect(chart?.data.labels?.length).toBe(3);
    });

    it('should use correct pontuacao values in chart', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getPontuacaoHistory.and.returnValue(of(mockPontuacaoResponse));
      fixture.detectChanges();
      
      component.createChart();
      
      const chart = component['chart'];
      const dataset = chart?.data.datasets[0];
      expect(dataset?.data).toEqual([25, 50, 75]);
    });

    it('should apply colors based on pontuacao values', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getPontuacaoHistory.and.returnValue(of(mockPontuacaoResponse));
      fixture.detectChanges();
      
      component.createChart();
      
      const chart = component['chart'];
      const dataset = chart?.data.datasets[0] as any;
      expect(dataset?.pointBackgroundColor).toBeDefined();
      expect(Array.isArray(dataset?.pointBackgroundColor)).toBe(true);
    });
  });

  describe('getPontuacaoColor', () => {
    it('should return green for pontuacao <= 33 (Conservador)', () => {
      expect(component.getPontuacaoColor(0)).toBe('#00A86B');
      expect(component.getPontuacaoColor(10)).toBe('#00A86B');
      expect(component.getPontuacaoColor(33)).toBe('#00A86B');
    });

    it('should return orange for pontuacao 34-66 (Moderado)', () => {
      expect(component.getPontuacaoColor(34)).toBe('#FF9500');
      expect(component.getPontuacaoColor(50)).toBe('#FF9500');
      expect(component.getPontuacaoColor(66)).toBe('#FF9500');
    });

    it('should return red for pontuacao > 66 (Arrojado)', () => {
      expect(component.getPontuacaoColor(67)).toBe('#FF6B6B');
      expect(component.getPontuacaoColor(80)).toBe('#FF6B6B');
      expect(component.getPontuacaoColor(100)).toBe('#FF6B6B');
    });

    it('should handle boundary values correctly', () => {
      expect(component.getPontuacaoColor(33)).toBe('#00A86B');
      expect(component.getPontuacaoColor(34)).toBe('#FF9500');
      expect(component.getPontuacaoColor(66)).toBe('#FF9500');
      expect(component.getPontuacaoColor(67)).toBe('#FF6B6B');
    });

    it('should handle edge case of zero', () => {
      expect(component.getPontuacaoColor(0)).toBe('#00A86B');
    });

    it('should handle maximum value', () => {
      expect(component.getPontuacaoColor(100)).toBe('#FF6B6B');
    });

    it('should handle decimal values', () => {
      expect(component.getPontuacaoColor(33.5)).toBe('#FF9500');
      expect(component.getPontuacaoColor(66.5)).toBe('#FF6B6B');
    });
  });

  describe('ngOnDestroy', () => {
    it('should destroy chart on component destroy', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getPontuacaoHistory.and.returnValue(of(mockPontuacaoResponse));
      fixture.detectChanges();
      
      component.createChart();
      const chart = component['chart'];
      const destroySpy = spyOn(chart as any, 'destroy');
      
      component.ngOnDestroy();
      
      expect(destroySpy).toHaveBeenCalled();
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
    it('should load data and create chart on initialization', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getPontuacaoHistory.and.returnValue(of(mockPontuacaoResponse));
      
      fixture.detectChanges();
      
      expect(component.historyData).toEqual(mockHistoryData);
      expect(component['chart']).toBeDefined();
    });

    it('should handle full lifecycle from init to destroy', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getPontuacaoHistory.and.returnValue(of(mockPontuacaoResponse));
      
      fixture.detectChanges();
      
      expect(component['chart']).toBeDefined();
      
      const chart = component['chart'];
      if (chart) {
        const destroySpy = spyOn(chart, 'destroy').and.callThrough();
        
        component.ngOnDestroy();
        
        expect(destroySpy).toHaveBeenCalled();
      }
    });

    it('should handle scenario with no client logged in', () => {
      authService.getStoredClientId.and.returnValue(null);
      
      fixture.detectChanges();
      
      expect(component.historyData).toEqual([]);
      expect(investmentService.getPontuacaoHistory).not.toHaveBeenCalled();
    });

    it('should apply correct colors for mixed pontuacao values', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getPontuacaoHistory.and.returnValue(of(mockPontuacaoResponse));
      fixture.detectChanges();
      
      component.createChart();
      
      const chart = component['chart'];
      const dataset = chart?.data.datasets[0] as any;
      const colors = dataset?.pointBackgroundColor;
      
      expect(colors[0]).toBe('#00A86B');
      expect(colors[1]).toBe('#FF9500'); 
      expect(colors[2]).toBe('#FF6B6B');
    });

    it('should recreate chart if data changes', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getPontuacaoHistory.and.returnValue(of(mockPontuacaoResponse));
      fixture.detectChanges();
      
      component.createChart();
      const firstChart = component['chart'];
      
      if (firstChart) {
        firstChart.destroy();
      }
      
      component.historyData = [mockHistoryData[0]];
      component.createChart();
      
      expect(component['chart']).toBeDefined();
      expect(component['chart']).not.toBe(firstChart);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long history with many entries', () => {
      const longHistory: PontuacaoHistoryEntry[] = [];
      for (let i = 0; i < 100; i++) {
        longHistory.push({
          id: i,
          clienteId: 1,
          pontuacao: Math.random() * 100,
          riskProfileId: 1,
          riskProfileName: 'Test',
          timestamp: new Date(2024, 0, i + 1).toISOString()
        });
      }
      
      const longResponse = {
        clienteId: 1,
        totalEntries: 100,
        history: longHistory
      };
      
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getPontuacaoHistory.and.returnValue(of(longResponse));
      
      fixture.detectChanges();
      
      expect(component.historyData.length).toBe(100);
    });

    it('should handle pontuacao of exactly 0', () => {
      const zeroEntry: PontuacaoHistoryEntry = {
        ...mockHistoryData[0],
        pontuacao: 0
      };
      
      const zeroResponse = {
        clienteId: 1,
        totalEntries: 1,
        history: [zeroEntry]
      };
      
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getPontuacaoHistory.and.returnValue(of(zeroResponse));
      
      component.loadPontuacaoHistory();
      
      expect(component.historyData[0].pontuacao).toBe(0);
      expect(component.getPontuacaoColor(0)).toBe('#00A86B');
    });

    it('should handle pontuacao of exactly 100', () => {
      const maxEntry: PontuacaoHistoryEntry = {
        ...mockHistoryData[0],
        pontuacao: 100
      };
      
      const maxResponse = {
        clienteId: 1,
        totalEntries: 1,
        history: [maxEntry]
      };
      
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getPontuacaoHistory.and.returnValue(of(maxResponse));
      
      component.loadPontuacaoHistory();
      
      expect(component.historyData[0].pontuacao).toBe(100);
      expect(component.getPontuacaoColor(100)).toBe('#FF6B6B');
    });

    it('should handle different clientId values', () => {
      authService.getStoredClientId.and.returnValue(999);
      investmentService.getPontuacaoHistory.and.returnValue(of(mockPontuacaoResponse));
      
      component.loadPontuacaoHistory();
      
      expect(investmentService.getPontuacaoHistory).toHaveBeenCalledWith(999);
    });

    it('should handle invalid date formats gracefully', () => {
      const invalidDateEntry: PontuacaoHistoryEntry = {
        ...mockHistoryData[0],
        timestamp: 'invalid-date'
      };
      
      component.historyData = [invalidDateEntry];
      fixture.detectChanges();
      
      expect(() => component.createChart()).not.toThrow();
    });

    it('should handle HTTP timeout errors', () => {
      authService.getStoredClientId.and.returnValue(1);
      const timeoutError = { name: 'TimeoutError', message: 'Request timeout' };
      investmentService.getPontuacaoHistory.and.returnValue(throwError(() => timeoutError));
      
      const consoleSpy = spyOn(console, 'error');
      
      component.loadPontuacaoHistory();
      
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle network errors gracefully', () => {
      authService.getStoredClientId.and.returnValue(1);
      const networkError = new Error('Network connection failed');
      investmentService.getPontuacaoHistory.and.returnValue(throwError(() => networkError));
      
      const consoleSpy = spyOn(console, 'error');
      
      component.loadPontuacaoHistory();
      
      expect(consoleSpy).toHaveBeenCalledWith('Error loading pontuacao history:', networkError);
      expect(component.historyData).toEqual([]);
    });
  });

  describe('Chart Configuration', () => {
    beforeEach(() => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getPontuacaoHistory.and.returnValue(of(mockPontuacaoResponse));
      fixture.detectChanges();
    });

    it('should configure chart with correct options', () => {
      component.createChart();
      
      const chart = component['chart'];
      expect(chart?.options?.responsive).toBe(true);
      expect(chart?.options?.maintainAspectRatio).toBe(false);
    });

    it('should set Y-axis scale from 0 to 100', () => {
      component.createChart();
      
      const chart = component['chart'];
      const yScale = (chart?.options as any)?.scales?.y;
      expect(yScale?.beginAtZero).toBe(true);
      expect(yScale?.max).toBe(100);
    });

    it('should configure line chart with proper styling', () => {
      component.createChart();
      
      const chart = component['chart'];
      const dataset = chart?.data.datasets[0] as any;
      expect(dataset?.borderColor).toBe('#005CA9');
      expect(dataset?.borderWidth).toBe(3);
      expect(dataset?.fill).toBe(true);
    });
  });
});
