import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../services/auth.service';
import { InvestmentService } from '../../services/investment.service';
import { Investment } from '../../models/investment.models';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let investmentService: jasmine.SpyObj<InvestmentService>;

  const mockUserProfile = {
    clienteId: 1,
    nome: 'João Silva',
    email: 'joao@example.com',
    pontuacao: 75,
    perfilRisco: {
      id: 2,
      name: 'Moderado',
      description: 'Perfil equilibrado'
    }
  };

  const mockInvestments: Investment[] = [
    {
      id: 1,
      userId: 1,
      productId: 1,
      valor: 10000,
      dataInicio: '2024-01-15',
      prazoMeses: 12,
      valorAtual: 10800,
      produto: {
        id: 1,
        nome: 'CDB Pós-fixado',
        tipo: 'Renda Fixa',
        taxaAnual: 0.08,
        risco: 'Baixo',
        aplicacaoMinima: 1000,
        liquidez: 'Diária',
        riskProfileId: 1
      }
    },
    {
      id: 2,
      userId: 1,
      productId: 2,
      valor: 5000,
      dataInicio: '2024-02-10',
      prazoMeses: 24,
      valorAtual: 5400,
      produto: {
        id: 2,
        nome: 'Tesouro Selic',
        tipo: 'Renda Fixa',
        taxaAnual: 0.10,
        risco: 'Baixo',
        aplicacaoMinima: 100,
        liquidez: 'Imediata',
        riskProfileId: 1
      }
    }
  ];

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getStoredClientId',
      'getUserProfile'
    ], {
      currentUser$: of(1)
    });

    const investmentServiceSpy = jasmine.createSpyObj('InvestmentService', [
      'getUserInvestments',
      'getPontuacaoHistory'
    ]);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: InvestmentService, useValue: investmentServiceSpy },
        provideRouter([]),
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    investmentService = TestBed.inject(InvestmentService) as jasmine.SpyObj<InvestmentService>;

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.userProfile).toBeNull();
      expect(component.investments).toEqual([]);
      expect(component.summary).toEqual({
        valorTotalInvestido: 0,
        rentabilidadeAcumulada: 0,
        numeroInvestimentos: 0,
        valorAtualTotal: 0
      });
      expect(component.isLoading).toBe(false);
      expect(component.clienteId).toBeNull();
    });

    it('should load user profile and investments on init', () => {
      authService.getStoredClientId.and.returnValue(1);
      authService.getUserProfile.and.returnValue(of(mockUserProfile));
      investmentService.getUserInvestments.and.returnValue(of(mockInvestments));

      component.ngOnInit();

      expect(authService.getStoredClientId).toHaveBeenCalled();
      expect(authService.getUserProfile).toHaveBeenCalledWith(1);
      expect(investmentService.getUserInvestments).toHaveBeenCalledWith(1);
      expect(component.userProfile).toEqual(mockUserProfile);
      expect(component.investments).toEqual(mockInvestments);
      expect(component.isLoading).toBe(false);
    });

    it('should handle missing clientId', () => {
      spyOn(console, 'error');
      authService.getStoredClientId.and.returnValue(null);

      component.ngOnInit();

      expect(component.isLoading).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Cliente ID não encontrado');
      expect(authService.getUserProfile).not.toHaveBeenCalled();
    });

    it('should handle error loading user profile', () => {
      spyOn(console, 'error');
      const error = new Error('Profile load failed');
      authService.getStoredClientId.and.returnValue(1);
      authService.getUserProfile.and.returnValue(throwError(() => error));

      component.ngOnInit();

      expect(component.isLoading).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Erro ao carregar perfil:', error);
    });

    it('should handle error loading investments', () => {
      spyOn(console, 'error');
      const error = new Error('Investments load failed');
      authService.getStoredClientId.and.returnValue(1);
      authService.getUserProfile.and.returnValue(of(mockUserProfile));
      investmentService.getUserInvestments.and.returnValue(throwError(() => error));

      component.ngOnInit();

      expect(component.isLoading).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Erro ao carregar investimentos:', error);
    });
  });

  describe('loadInvestments', () => {
    beforeEach(() => {
      component.clienteId = 1;
    });

    it('should load investments successfully', () => {
      investmentService.getUserInvestments.and.returnValue(of(mockInvestments));

      component.loadInvestments();

      expect(investmentService.getUserInvestments).toHaveBeenCalledWith(1);
      expect(component.investments).toEqual(mockInvestments);
      expect(component.isLoading).toBe(false);
    });

    it('should not load investments if clientId is null', () => {
      component.clienteId = null;

      component.loadInvestments();

      expect(investmentService.getUserInvestments).not.toHaveBeenCalled();
    });

    it('should calculate summary after loading investments', () => {
      investmentService.getUserInvestments.and.returnValue(of(mockInvestments));
      spyOn(component, 'calculateSummary');

      component.loadInvestments();

      expect(component.calculateSummary).toHaveBeenCalled();
    });
  });

  describe('calculateSummary', () => {
    it('should calculate summary with no investments', () => {
      component.investments = [];

      component.calculateSummary();

      expect(component.summary).toEqual({
        numeroInvestimentos: 0,
        valorTotalInvestido: 0,
        valorAtualTotal: 0,
        rentabilidadeAcumulada: 0
      });
    });

    it('should calculate summary with investments', () => {
      component.investments = mockInvestments;

      component.calculateSummary();

      expect(component.summary.numeroInvestimentos).toBe(2);
      expect(component.summary.valorTotalInvestido).toBe(15000);
      expect(component.summary.valorAtualTotal).toBe(16200);
      expect(component.summary.rentabilidadeAcumulada).toBe(1200);
    });

    it('should calculate summary with single investment', () => {
      component.investments = [mockInvestments[0]];

      component.calculateSummary();

      expect(component.summary.numeroInvestimentos).toBe(1);
      expect(component.summary.valorTotalInvestido).toBe(10000);
      expect(component.summary.valorAtualTotal).toBe(10800);
      expect(component.summary.rentabilidadeAcumulada).toBe(800);
    });
  });

  describe('getRiskProfileClass', () => {
    it('should return empty string if no user profile', () => {
      component.userProfile = null;

      expect(component.getRiskProfileClass()).toBe('');
    });

    it('should return "conservador" for conservative profile', () => {
      component.userProfile = {
        ...mockUserProfile,
        perfilRisco: { id: 1, name: 'Conservador', description: 'Perfil conservador' }
      };

      expect(component.getRiskProfileClass()).toBe('conservador');
    });

    it('should return "moderado" for moderate profile', () => {
      component.userProfile = mockUserProfile;

      expect(component.getRiskProfileClass()).toBe('moderado');
    });

    it('should return "agressivo" for aggressive profile', () => {
      component.userProfile = {
        ...mockUserProfile,
        perfilRisco: { id: 3, name: 'Agressivo', description: 'Perfil agressivo' }
      };

      expect(component.getRiskProfileClass()).toBe('agressivo');
    });

    it('should handle case insensitive profile names', () => {
      component.userProfile = {
        ...mockUserProfile,
        perfilRisco: { id: 1, name: 'CONSERVADOR', description: 'Test' }
      };

      expect(component.getRiskProfileClass()).toBe('conservador');
    });

    it('should return empty string for unknown profile', () => {
      component.userProfile = {
        ...mockUserProfile,
        perfilRisco: { id: 4, name: 'Unknown', description: 'Test' }
      };

      expect(component.getRiskProfileClass()).toBe('');
    });
  });

  describe('getRiskProfileIcon', () => {
    it('should return default icon if no user profile', () => {
      component.userProfile = null;

      expect(component.getRiskProfileIcon()).toBe('show_chart');
    });

    it('should return "shield" for conservative profile', () => {
      component.userProfile = {
        ...mockUserProfile,
        perfilRisco: { id: 1, name: 'Conservador', description: 'Test' }
      };

      expect(component.getRiskProfileIcon()).toBe('shield');
    });

    it('should return "balance" for moderate profile', () => {
      component.userProfile = mockUserProfile;

      expect(component.getRiskProfileIcon()).toBe('balance');
    });

    it('should return "rocket_launch" for aggressive profile', () => {
      component.userProfile = {
        ...mockUserProfile,
        perfilRisco: { id: 3, name: 'Agressivo', description: 'Test' }
      };

      expect(component.getRiskProfileIcon()).toBe('rocket_launch');
    });

    it('should return default icon for unknown profile', () => {
      component.userProfile = {
        ...mockUserProfile,
        perfilRisco: { id: 4, name: 'Unknown', description: 'Test' }
      };

      expect(component.getRiskProfileIcon()).toBe('show_chart');
    });
  });

  describe('getGreeting', () => {
    it('should return "Bom dia" for morning hours', () => {
      spyOn(Date.prototype, 'getHours').and.returnValue(8);

      expect(component.getGreeting()).toBe('Bom dia');
    });

    it('should return "Bom dia" at midnight', () => {
      spyOn(Date.prototype, 'getHours').and.returnValue(0);

      expect(component.getGreeting()).toBe('Bom dia');
    });

    it('should return "Boa tarde" for afternoon hours', () => {
      spyOn(Date.prototype, 'getHours').and.returnValue(15);

      expect(component.getGreeting()).toBe('Boa tarde');
    });

    it('should return "Boa tarde" at noon', () => {
      spyOn(Date.prototype, 'getHours').and.returnValue(12);

      expect(component.getGreeting()).toBe('Boa tarde');
    });

    it('should return "Boa noite" for evening hours', () => {
      spyOn(Date.prototype, 'getHours').and.returnValue(20);

      expect(component.getGreeting()).toBe('Boa noite');
    });

    it('should return "Boa noite" at 6 PM', () => {
      spyOn(Date.prototype, 'getHours').and.returnValue(18);

      expect(component.getGreeting()).toBe('Boa noite');
    });
  });

  describe('Template Integration', () => {
    it('should set isLoading to true initially', () => {
      component.isLoading = true;
      
      expect(component.isLoading).toBe(true);
    });

    it('should update user profile after successful load', () => {
      authService.getStoredClientId.and.returnValue(1);
      authService.getUserProfile.and.returnValue(of(mockUserProfile));
      investmentService.getUserInvestments.and.returnValue(of(mockInvestments));

      component.ngOnInit();

      expect(component.userProfile).toEqual(mockUserProfile);
    });

    it('should update summary after loading investments', () => {
      component.investments = mockInvestments;
      component.calculateSummary();
      
      expect(component.summary.numeroInvestimentos).toBe(2);
      expect(component.summary.valorTotalInvestido).toBe(15000);
    });

    it('should set isLoading to false after data load', () => {
      component.clienteId = 1;
      investmentService.getUserInvestments.and.returnValue(of(mockInvestments));
      
      component.loadInvestments();
      
      expect(component.isLoading).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle investments with zero values', () => {
      component.investments = [{
        ...mockInvestments[0],
        valor: 0,
        valorAtual: 0
      }];

      component.calculateSummary();

      expect(component.summary.valorTotalInvestido).toBe(0);
      expect(component.summary.valorAtualTotal).toBe(0);
      expect(component.summary.rentabilidadeAcumulada).toBe(0);
    });

    it('should handle negative rentability', () => {
      component.investments = [{
        ...mockInvestments[0],
        valor: 10000,
        valorAtual: 9500
      }];

      component.calculateSummary();

      expect(component.summary.rentabilidadeAcumulada).toBe(-500);
    });

    it('should handle profile names with partial matches', () => {
      component.userProfile = {
        ...mockUserProfile,
        perfilRisco: { id: 1, name: 'Super Conservador', description: 'Test' }
      };

      expect(component.getRiskProfileClass()).toBe('conservador');
    });
  });
});
