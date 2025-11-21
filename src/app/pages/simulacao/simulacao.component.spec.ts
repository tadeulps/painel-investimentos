import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { of, throwError } from 'rxjs';
import { SimulacaoComponent } from './simulacao.component';
import { InvestmentService } from '../../services/investment.service';
import { AuthService } from '../../services/auth.service';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('SimulacaoComponent', () => {
  let component: SimulacaoComponent;
  let fixture: ComponentFixture<SimulacaoComponent>;
  let investmentService: jasmine.SpyObj<InvestmentService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let activatedRoute: any;

  const mockProducts = [
    {
      id: 1,
      nome: 'Poupança Caixa',
      tipo: 'Poupança',
      taxaAnual: 0.0617,
      liquidez: 'Imediata',
      aplicacaoMinima: 50,
      risco: 'Baixo',
      riskProfileId: 1,
      descricao: 'Investimento tradicional'
    },
    {
      id: 2,
      nome: 'LCI Banco Caixa',
      tipo: 'LCI',
      taxaAnual: 0.095,
      liquidez: '90 dias',
      aplicacaoMinima: 1000,
      risco: 'Baixo',
      riskProfileId: 1,
      descricao: 'Isento de IR'
    },
    {
      id: 3,
      nome: 'CDB Banco',
      tipo: 'Renda Fixa',
      taxaAnual: 0.12,
      liquidez: '180 dias',
      aplicacaoMinima: 500,
      risco: 'Médio',
      riskProfileId: 2,
      descricao: 'Risco moderado'
    }
  ];

  beforeEach(async () => {
    const investmentServiceSpy = jasmine.createSpyObj('InvestmentService', [
      'getProducts',
      'createInvestment'
    ]);

    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getStoredClientId'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    activatedRoute = {
      queryParams: of({})
    };

    await TestBed.configureTestingModule({
      imports: [SimulacaoComponent, ReactiveFormsModule, MatDialogModule],
      providers: [
        { provide: InvestmentService, useValue: investmentServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },
        provideHttpClient(),
        provideNoopAnimations()
      ]
    }).compileComponents();

    investmentService = TestBed.inject(InvestmentService) as jasmine.SpyObj<InvestmentService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    fixture = TestBed.createComponent(SimulacaoComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with validators', () => {
      expect(component.simulationForm).toBeDefined();
      expect(component.simulationForm.get('valor')).toBeDefined();
      expect(component.simulationForm.get('prazoMeses')).toBeDefined();
    });

    it('should initialize with default values', () => {
      expect(component.selectedProduct).toBeNull();
      expect(component.currentProductIndex).toBe(0);
      expect(component.simulationResult).toBeNull();
      expect(component.isLoading).toBe(false);
      expect(component.isInvesting).toBe(false);
      expect(component.clienteId).toBeNull();
      expect(component.showAllMonths).toBe(false);
      expect(component.availableProducts).toEqual([]);
    });

    it('should load products and client ID on init', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getProducts.and.returnValue(of(mockProducts));

      component.ngOnInit();

      expect(authService.getStoredClientId).toHaveBeenCalled();
      expect(component.clienteId).toBe(1);
      expect(investmentService.getProducts).toHaveBeenCalled();
      expect(component.availableProducts).toEqual(mockProducts);
    });

    it('should handle products loading error', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getProducts.and.returnValue(throwError(() => new Error('Network error')));
      spyOn(console, 'error');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalledWith('Erro ao carregar produtos:', jasmine.any(Error));
      expect(component.isLoading).toBe(false);
    });

    it('should load product from query params', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getProducts.and.returnValue(of(mockProducts));
      activatedRoute.queryParams = of({ productId: '2' });

      component.ngOnInit();

      expect(component.selectedProduct?.id).toBe(2);
      expect(component.selectedProduct?.nome).toBe('LCI Banco Caixa');
    });

    it('should handle invalid product ID in query params', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getProducts.and.returnValue(of(mockProducts));
      activatedRoute.queryParams = of({ productId: '999' });

      component.ngOnInit();

      expect(component.selectedProduct).toBeNull();
    });
  });

  describe('Form Validation', () => {
    it('should require valor field', () => {
      const valorControl = component.simulationForm.get('valor');
      valorControl?.setValue(null);

      expect(valorControl?.hasError('required')).toBe(true);
    });

    it('should validate valor minimum', () => {
      const valorControl = component.simulationForm.get('valor');
      valorControl?.setValue(50);

      expect(valorControl?.hasError('min')).toBe(true);

      valorControl?.setValue(100);
      expect(valorControl?.hasError('min')).toBe(false);
    });

    it('should require prazoMeses field', () => {
      const prazoControl = component.simulationForm.get('prazoMeses');
      prazoControl?.setValue(null);

      expect(prazoControl?.hasError('required')).toBe(true);
    });

    it('should validate prazoMeses minimum', () => {
      const prazoControl = component.simulationForm.get('prazoMeses');
      prazoControl?.setValue(0);

      expect(prazoControl?.hasError('min')).toBe(true);

      prazoControl?.setValue(1);
      expect(prazoControl?.hasError('min')).toBe(false);
    });

    it('should validate prazoMeses maximum', () => {
      const prazoControl = component.simulationForm.get('prazoMeses');
      prazoControl?.setValue(400);

      expect(prazoControl?.hasError('max')).toBe(true);

      prazoControl?.setValue(360);
      expect(prazoControl?.hasError('max')).toBe(false);
    });
  });

  describe('selectProduct', () => {
    it('should select a product', () => {
      component.selectProduct(mockProducts[0]);

      expect(component.selectedProduct).toEqual(mockProducts[0]);
    });

    it('should change selected product', () => {
      component.selectProduct(mockProducts[0]);
      expect(component.selectedProduct?.id).toBe(1);

      component.selectProduct(mockProducts[1]);
      expect(component.selectedProduct?.id).toBe(2);
    });
  });

  describe('Product Navigation', () => {
    beforeEach(() => {
      component.availableProducts = mockProducts;
    });

    it('should navigate to previous product', () => {
      component.currentProductIndex = 2;

      component.previousProduct();

      expect(component.currentProductIndex).toBe(1);
    });

    it('should not go below index 0', () => {
      component.currentProductIndex = 0;

      component.previousProduct();

      expect(component.currentProductIndex).toBe(0);
    });

    it('should navigate to next product', () => {
      component.currentProductIndex = 0;

      component.nextProduct();

      expect(component.currentProductIndex).toBe(1);
    });

    it('should not exceed products length', () => {
      component.currentProductIndex = 2;

      component.nextProduct();

      expect(component.currentProductIndex).toBe(2);
    });

    it('should go to specific product index', () => {
      component.goToProduct(1);

      expect(component.currentProductIndex).toBe(1);
    });
  });

  describe('changeProduct', () => {
    it('should reset selected product and simulation', () => {
      component.selectedProduct = mockProducts[0];
      component.simulationResult = {
        valorInicial: 1000,
        valorFinal: 1100,
        rendimentoTotal: 100,
        prazoMeses: 12,
        detalheMensal: []
      };
      component.simulationForm.patchValue({ valor: 1000, prazoMeses: 12 });
      component.showAllMonths = true;

      component.changeProduct();

      expect(component.selectedProduct).toBeNull();
      expect(component.simulationResult).toBeNull();
      expect(component.simulationForm.get('valor')?.value).toBeNull();
      expect(component.simulationForm.get('prazoMeses')?.value).toBeNull();
      expect(component.showAllMonths).toBe(false);
    });
  });

  describe('getRiskClass', () => {
    it('should convert risk to lowercase without accents', () => {
      expect(component.getRiskClass('Baixo')).toBe('baixo');
      expect(component.getRiskClass('Médio')).toBe('medio');
      expect(component.getRiskClass('Alto')).toBe('alto');
    });
  });

  describe('getRiskIcon', () => {
    it('should return shield for baixo', () => {
      expect(component.getRiskIcon('Baixo')).toBe('shield');
    });

    it('should return balance for médio', () => {
      expect(component.getRiskIcon('Médio')).toBe('balance');
    });

    it('should return rocket_launch for alto', () => {
      expect(component.getRiskIcon('Alto')).toBe('rocket_launch');
    });

    it('should return show_chart for unknown', () => {
      expect(component.getRiskIcon('Desconhecido')).toBe('show_chart');
    });
  });

  describe('simulate', () => {
    beforeEach(() => {
      component.selectedProduct = mockProducts[0];
    });

    it('should not simulate if form is invalid', () => {
      component.simulationForm.patchValue({ valor: 50, prazoMeses: null });

      component.simulate();

      expect(component.simulationResult).toBeNull();
    });

    it('should not simulate if no product selected', () => {
      component.selectedProduct = null;
      component.simulationForm.patchValue({ valor: 1000, prazoMeses: 12 });

      component.simulate();

      expect(component.simulationResult).toBeNull();
    });

    it('should calculate simulation correctly', () => {
      component.simulationForm.patchValue({ valor: 1000, prazoMeses: 12 });

      component.simulate();

      expect(component.simulationResult).toBeDefined();
      expect(component.simulationResult?.valorInicial).toBe(1000);
      expect(component.simulationResult?.prazoMeses).toBe(12);
      expect(component.simulationResult?.valorFinal).toBeGreaterThan(1000);
      expect(component.simulationResult?.rendimentoTotal).toBeGreaterThan(0);
      expect(component.simulationResult?.detalheMensal.length).toBe(12);
    });

    it('should calculate monthly details', () => {
      component.simulationForm.patchValue({ valor: 1000, prazoMeses: 3 });

      component.simulate();

      const detalheMensal = component.simulationResult?.detalheMensal;
      expect(detalheMensal?.length).toBe(3);
      expect(detalheMensal?.[0].mes).toBe(1);
      expect(detalheMensal?.[1].mes).toBe(2);
      expect(detalheMensal?.[2].mes).toBe(3);
      expect(detalheMensal?.[0].saldo).toBeGreaterThan(1000);
    });

    it('should reset showAllMonths when simulating', () => {
      component.showAllMonths = true;
      component.simulationForm.patchValue({ valor: 1000, prazoMeses: 12 });

      component.simulate();

      expect(component.showAllMonths).toBe(false);
    });

    it('should calculate compound interest correctly', () => {
      component.simulationForm.patchValue({ valor: 1000, prazoMeses: 12 });
      const taxaAnual = mockProducts[0].taxaAnual;

      component.simulate();

      const expectedFinalValue = 1000 * Math.pow(1 + taxaAnual, 1);
      expect(component.simulationResult?.valorFinal).toBeCloseTo(expectedFinalValue, 0);
    });
  });

  describe('displayedMonths', () => {
    it('should return empty array if no simulation result', () => {
      component.simulationResult = null;

      expect(component.displayedMonths).toEqual([]);
    });

    it('should return all months if 20 or fewer', () => {
      component.simulationResult = {
        valorInicial: 1000,
        valorFinal: 1100,
        rendimentoTotal: 100,
        prazoMeses: 12,
        detalheMensal: Array.from({ length: 12 }, (_, i) => ({
          mes: i + 1,
          saldo: 1000 + (i + 1) * 10,
          rendimento: 10
        }))
      };

      expect(component.displayedMonths.length).toBe(12);
    });

    it('should return condensed view for more than 20 months', () => {
      component.simulationResult = {
        valorInicial: 1000,
        valorFinal: 1500,
        rendimentoTotal: 500,
        prazoMeses: 30,
        detalheMensal: Array.from({ length: 30 }, (_, i) => ({
          mes: i + 1,
          saldo: 1000 + (i + 1) * 10,
          rendimento: 10
        }))
      };

      const displayed = component.displayedMonths;
      expect(displayed.length).toBe(21); // 10 + separator + 10
      expect(displayed[10].isSeparator).toBe(true);
    });

    it('should return all months if showAllMonths is true', () => {
      component.simulationResult = {
        valorInicial: 1000,
        valorFinal: 1500,
        rendimentoTotal: 500,
        prazoMeses: 30,
        detalheMensal: Array.from({ length: 30 }, (_, i) => ({
          mes: i + 1,
          saldo: 1000 + (i + 1) * 10,
          rendimento: 10
        }))
      };
      component.showAllMonths = true;

      expect(component.displayedMonths.length).toBe(30);
    });
  });

  describe('shouldShowExpandButton', () => {
    it('should return false if no simulation result', () => {
      component.simulationResult = null;

      expect(component.shouldShowExpandButton).toBe(false);
    });

    it('should return false if 20 or fewer months', () => {
      component.simulationResult = {
        valorInicial: 1000,
        valorFinal: 1100,
        rendimentoTotal: 100,
        prazoMeses: 12,
        detalheMensal: Array.from({ length: 12 }, (_, i) => ({
          mes: i + 1,
          saldo: 1000,
          rendimento: 10
        }))
      };

      expect(component.shouldShowExpandButton).toBe(false);
    });

    it('should return true if more than 20 months and not showing all', () => {
      component.simulationResult = {
        valorInicial: 1000,
        valorFinal: 1500,
        rendimentoTotal: 500,
        prazoMeses: 30,
        detalheMensal: Array.from({ length: 30 }, (_, i) => ({
          mes: i + 1,
          saldo: 1000,
          rendimento: 10
        }))
      };
      component.showAllMonths = false;

      expect(component.shouldShowExpandButton).toBe(true);
    });

    it('should return false if showing all months', () => {
      component.simulationResult = {
        valorInicial: 1000,
        valorFinal: 1500,
        rendimentoTotal: 500,
        prazoMeses: 30,
        detalheMensal: Array.from({ length: 30 }, (_, i) => ({
          mes: i + 1,
          saldo: 1000,
          rendimento: 10
        }))
      };
      component.showAllMonths = true;

      expect(component.shouldShowExpandButton).toBe(false);
    });
  });

  describe('hiddenMonthsCount', () => {
    it('should return 0 if no simulation result', () => {
      component.simulationResult = null;

      expect(component.hiddenMonthsCount).toBe(0);
    });

    it('should calculate hidden months correctly', () => {
      component.simulationResult = {
        valorInicial: 1000,
        valorFinal: 1500,
        rendimentoTotal: 500,
        prazoMeses: 30,
        detalheMensal: Array.from({ length: 30 }, () => ({
          mes: 1,
          saldo: 1000,
          rendimento: 10
        }))
      };

      expect(component.hiddenMonthsCount).toBe(10);
    });
  });

  describe('toggleShowAllMonths', () => {
    it('should toggle showAllMonths', () => {
      component.showAllMonths = false;

      component.toggleShowAllMonths();
      expect(component.showAllMonths).toBe(true);

      component.toggleShowAllMonths();
      expect(component.showAllMonths).toBe(false);
    });
  });

  describe('isSeparatorRow', () => {
    it('should return true for separator rows', () => {
      const separatorRow = { mes: -1, saldo: 0, rendimento: 0, isSeparator: true };

      expect(component.isSeparatorRow(separatorRow)).toBe(true);
    });

    it('should return false for normal rows', () => {
      const normalRow = { mes: 1, saldo: 1000, rendimento: 10 };

      expect(component.isSeparatorRow(normalRow)).toBe(false);
    });
  });

  describe('newSimulation', () => {
    it('should reset simulation and form', () => {
      component.simulationResult = {
        valorInicial: 1000,
        valorFinal: 1100,
        rendimentoTotal: 100,
        prazoMeses: 12,
        detalheMensal: []
      };
      component.simulationForm.patchValue({ valor: 1000, prazoMeses: 12 });
      component.showAllMonths = true;

      component.newSimulation();

      expect(component.simulationResult).toBeNull();
      expect(component.simulationForm.get('valor')?.value).toBeNull();
      expect(component.simulationForm.get('prazoMeses')?.value).toBeNull();
      expect(component.showAllMonths).toBe(false);
    });
  });

  describe('proceedToInvest', () => {
    it('should alert if no product selected', () => {
      spyOn(window, 'alert');
      component.selectedProduct = null;

      component.proceedToInvest();

      expect(window.alert).toHaveBeenCalledWith('Erro: Dados incompletos para realizar o investimento.');
    });

    it('should alert if no simulation result', () => {
      spyOn(window, 'alert');
      component.selectedProduct = mockProducts[0];
      component.simulationResult = null;

      component.proceedToInvest();

      expect(window.alert).toHaveBeenCalledWith('Erro: Dados incompletos para realizar o investimento.');
    });

    it('should alert if no client ID', () => {
      spyOn(window, 'alert');
      component.selectedProduct = mockProducts[0];
      component.simulationResult = {
        valorInicial: 1000,
        valorFinal: 1100,
        rendimentoTotal: 100,
        prazoMeses: 12,
        detalheMensal: []
      };
      component.clienteId = null;

      component.proceedToInvest();

      expect(window.alert).toHaveBeenCalledWith('Erro: Dados incompletos para realizar o investimento.');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero taxaAnual', () => {
      component.selectedProduct = { ...mockProducts[0], taxaAnual: 0 };
      component.simulationForm.patchValue({ valor: 1000, prazoMeses: 12 });

      component.simulate();

      expect(component.simulationResult?.valorFinal).toBe(1000);
      expect(component.simulationResult?.rendimentoTotal).toBe(0);
    });

    it('should handle very long simulation period', () => {
      component.selectedProduct = mockProducts[0];
      component.simulationForm.patchValue({ valor: 1000, prazoMeses: 360 });

      component.simulate();

      expect(component.simulationResult?.detalheMensal.length).toBe(360);
      expect(component.displayedMonths.length).toBe(21); // condensed view
    });

    it('should handle minimum valid values', () => {
      component.selectedProduct = mockProducts[0];
      component.simulationForm.patchValue({ valor: 100, prazoMeses: 1 });

      component.simulate();

      expect(component.simulationResult).toBeDefined();
      expect(component.simulationResult?.valorInicial).toBe(100);
      expect(component.simulationResult?.prazoMeses).toBe(1);
    });
  });

  describe('Integration Tests', () => {
    it('should complete full simulation flow', () => {
      authService.getStoredClientId.and.returnValue(1);
      investmentService.getProducts.and.returnValue(of(mockProducts));

      component.ngOnInit();

      component.selectProduct(mockProducts[0]);
      component.simulationForm.patchValue({ valor: 1000, prazoMeses: 12 });
      component.simulate();

      expect(component.simulationResult).toBeDefined();
      expect(component.simulationResult?.valorFinal).toBeGreaterThan(1000);
    });

    it('should handle complete product change flow', () => {
      component.availableProducts = mockProducts;
      component.selectProduct(mockProducts[0]);
      component.simulationForm.patchValue({ valor: 1000, prazoMeses: 12 });
      component.simulate();

      expect(component.simulationResult).toBeDefined();

      component.changeProduct();

      expect(component.selectedProduct).toBeNull();
      expect(component.simulationResult).toBeNull();
      expect(component.simulationForm.value.valor).toBeNull();
    });
  });
});
