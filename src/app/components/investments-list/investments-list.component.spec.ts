import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvestmentsListComponent } from './investments-list.component';
import { Investment } from '../../core/models/investment.models';
import { provideRouter } from '@angular/router';

describe('InvestmentsListComponent', () => {
  let component: InvestmentsListComponent;
  let fixture: ComponentFixture<InvestmentsListComponent>;

  const mockInvestments: Investment[] = [
    {
      id: 1,
      userId: 1,
      productId: 1,
      valor: 1000,
      dataInicio: '2024-01-15',
      prazoMeses: 12,
      valorAtual: 1100,
      produto: {
        id: 1,
        nome: 'Poupança Caixa',
        tipo: 'Poupança',
        taxaAnual: 6.17,
        risco: 'Baixo',
        aplicacaoMinima: 50,
        liquidez: 'Imediata',
        riskProfileId: 1
      }
    },
    {
      id: 2,
      userId: 1,
      productId: 2,
      valor: 5000,
      dataInicio: '2024-06-01',
      prazoMeses: 24,
      valorAtual: 5500,
      produto: {
        id: 2,
        nome: 'CDB Renda Fixa',
        tipo: 'CDB',
        taxaAnual: 10.5,
        risco: 'Médio',
        aplicacaoMinima: 1000,
        liquidez: '180 dias',
        riskProfileId: 2
      }
    },
    {
      id: 3,
      userId: 1,
      productId: 3,
      valor: 10000,
      dataInicio: '2024-03-20',
      prazoMeses: 36,
      valorAtual: 12000,
      produto: {
        id: 3,
        nome: 'Ações Petrobras',
        tipo: 'Renda Variável',
        taxaAnual: 15.0,
        risco: 'Alto',
        aplicacaoMinima: 100,
        liquidez: 'D+2',
        riskProfileId: 3
      }
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestmentsListComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty investments array', () => {
      expect(component.investments).toEqual([]);
    });

    it('should have displayLimit of 5', () => {
      expect(component.displayLimit).toBe(5);
    });

    it('should not show all investments by default', () => {
      expect(component.showAll).toBe(false);
    });
  });

  describe('displayedInvestments', () => {
    it('should return all investments when showAll is true', () => {
      component.investments = mockInvestments;
      component.showAll = true;

      expect(component.displayedInvestments.length).toBe(3);
      expect(component.displayedInvestments).toEqual(mockInvestments);
    });

    it('should return limited investments when showAll is false', () => {
      component.investments = [...mockInvestments, ...mockInvestments, ...mockInvestments];
      component.showAll = false;

      expect(component.displayedInvestments.length).toBe(5);
    });

    it('should return all investments if less than displayLimit', () => {
      component.investments = mockInvestments;
      component.showAll = false;

      expect(component.displayedInvestments.length).toBe(3);
    });

    it('should handle empty investments array', () => {
      component.investments = [];
      
      expect(component.displayedInvestments).toEqual([]);
    });
  });

  describe('hasMore', () => {
    it('should return true when investments exceed displayLimit', () => {
      component.investments = Array(10).fill(mockInvestments[0]);
      
      expect(component.hasMore).toBe(true);
    });

    it('should return false when investments are less than displayLimit', () => {
      component.investments = mockInvestments;
      
      expect(component.hasMore).toBe(false);
    });

    it('should return false when investments equal displayLimit', () => {
      component.investments = Array(5).fill(mockInvestments[0]);
      
      expect(component.hasMore).toBe(false);
    });

    it('should return false for empty investments', () => {
      component.investments = [];
      
      expect(component.hasMore).toBe(false);
    });
  });

  describe('toggleShowAll', () => {
    it('should toggle showAll from false to true', () => {
      component.showAll = false;
      
      component.toggleShowAll();
      
      expect(component.showAll).toBe(true);
    });

    it('should toggle showAll from true to false', () => {
      component.showAll = true;
      
      component.toggleShowAll();
      
      expect(component.showAll).toBe(false);
    });

    it('should toggle multiple times', () => {
      expect(component.showAll).toBe(false);
      
      component.toggleShowAll();
      expect(component.showAll).toBe(true);
      
      component.toggleShowAll();
      expect(component.showAll).toBe(false);
      
      component.toggleShowAll();
      expect(component.showAll).toBe(true);
    });
  });

  describe('calculateReturn', () => {
    it('should calculate positive return', () => {
      const investment = mockInvestments[0];
      
      const result = component.calculateReturn(investment);
      
      expect(result).toBe(100);
    });

    it('should calculate negative return', () => {
      const investment = { ...mockInvestments[0], valorAtual: 900 };
      
      const result = component.calculateReturn(investment);
      
      expect(result).toBe(-100);
    });

    it('should return zero when no profit or loss', () => {
      const investment = { ...mockInvestments[0], valorAtual: 1000 };
      
      const result = component.calculateReturn(investment);
      
      expect(result).toBe(0);
    });
  });

  describe('calculateReturnPercentage', () => {
    it('should calculate positive return percentage', () => {
      const investment = mockInvestments[0];
      
      const result = component.calculateReturnPercentage(investment);
      
      expect(result).toBe(10);
    });

    it('should calculate negative return percentage', () => {
      const investment = { ...mockInvestments[0], valorAtual: 900 };
      
      const result = component.calculateReturnPercentage(investment);
      
      expect(result).toBe(-10);
    });

    it('should return 0 when valor is 0 to avoid division by zero', () => {
      const investment = { ...mockInvestments[0], valor: 0, valorAtual: 100 };
      
      const result = component.calculateReturnPercentage(investment);
      
      expect(result).toBe(0);
    });

    it('should return 0 when no profit or loss', () => {
      const investment = { ...mockInvestments[0], valorAtual: 1000 };
      
      const result = component.calculateReturnPercentage(investment);
      
      expect(result).toBe(0);
    });
  });

  describe('getRiskClass', () => {
    it('should return "baixo" for low risk', () => {
      expect(component.getRiskClass('Baixo')).toBe('baixo');
      expect(component.getRiskClass('baixo')).toBe('baixo');
      expect(component.getRiskClass('Conservador')).toBe('baixo');
      expect(component.getRiskClass('conservador')).toBe('baixo');
    });

    it('should return "medio" for medium risk', () => {
      expect(component.getRiskClass('Médio')).toBe('medio');
      expect(component.getRiskClass('médio')).toBe('medio');
      expect(component.getRiskClass('Moderado')).toBe('medio');
      expect(component.getRiskClass('moderado')).toBe('medio');
    });

    it('should return "alto" for high risk', () => {
      expect(component.getRiskClass('Alto')).toBe('alto');
      expect(component.getRiskClass('alto')).toBe('alto');
      expect(component.getRiskClass('Agressivo')).toBe('alto');
      expect(component.getRiskClass('agressivo')).toBe('alto');
    });

    it('should return "medio" for unknown risk', () => {
      expect(component.getRiskClass('Unknown')).toBe('medio');
      expect(component.getRiskClass('')).toBe('medio');
    });
  });

  describe('getRiskIcon', () => {
    it('should return "shield" for low risk', () => {
      expect(component.getRiskIcon('Baixo')).toBe('shield');
      expect(component.getRiskIcon('Conservador')).toBe('shield');
    });

    it('should return "balance" for medium risk', () => {
      expect(component.getRiskIcon('Médio')).toBe('balance');
      expect(component.getRiskIcon('Moderado')).toBe('balance');
    });

    it('should return "rocket_launch" for high risk', () => {
      expect(component.getRiskIcon('Alto')).toBe('rocket_launch');
      expect(component.getRiskIcon('Agressivo')).toBe('rocket_launch');
    });

    it('should return "show_chart" for unknown risk', () => {
      expect(component.getRiskIcon('Unknown')).toBe('show_chart');
      expect(component.getRiskIcon('')).toBe('show_chart');
    });
  });

  describe('getMonthsRemaining', () => {
    it('should calculate months remaining correctly', () => {
      const today = new Date();
      const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
      const investment = {
        ...mockInvestments[0],
        dataInicio: sixMonthsAgo.toISOString().split('T')[0],
        prazoMeses: 12
      };

      const result = component.getMonthsRemaining(investment);
      
      expect(result).toBe(6);
    });

    it('should return 0 when investment period has ended', () => {
      const today = new Date();
      const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
      const investment = {
        ...mockInvestments[0],
        dataInicio: twoYearsAgo.toISOString().split('T')[0],
        prazoMeses: 12
      };

      const result = component.getMonthsRemaining(investment);
      
      expect(result).toBe(0);
    });

    it('should return full prazoMeses for new investment', () => {
      const today = new Date();
      const investment = {
        ...mockInvestments[0],
        dataInicio: today.toISOString().split('T')[0],
        prazoMeses: 24
      };

      const result = component.getMonthsRemaining(investment);
      
      expect(result).toBe(24);
    });

    it('should never return negative months', () => {
      const today = new Date();
      const threeYearsAgo = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());
      const investment = {
        ...mockInvestments[0],
        dataInicio: threeYearsAgo.toISOString().split('T')[0],
        prazoMeses: 12
      };

      const result = component.getMonthsRemaining(investment);
      
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration Tests', () => {
    it('should display limited investments and toggle to show all', () => {
      component.investments = Array(10).fill(mockInvestments[0]);
      
      expect(component.displayedInvestments.length).toBe(5);
      expect(component.hasMore).toBe(true);
      
      component.toggleShowAll();
      
      expect(component.displayedInvestments.length).toBe(10);
      expect(component.showAll).toBe(true);
    });

    it('should handle complete investment data with calculations', () => {
      component.investments = mockInvestments;
      
      const investment = component.displayedInvestments[0];
      const returnValue = component.calculateReturn(investment);
      const returnPercentage = component.calculateReturnPercentage(investment);
      const riskClass = component.getRiskClass(investment.produto!.risco);
      const riskIcon = component.getRiskIcon(investment.produto!.risco);
      
      expect(returnValue).toBe(100);
      expect(returnPercentage).toBe(10);
      expect(riskClass).toBe('baixo');
      expect(riskIcon).toBe('shield');
    });
  });
});
