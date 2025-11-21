import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProdutosComponent } from './produtos.component';
import { AuthService } from '../../services/auth.service';
import { InvestmentService } from '../../services/investment.service';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('ProdutosComponent', () => {
  let component: ProdutosComponent;
  let fixture: ComponentFixture<ProdutosComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let investmentService: jasmine.SpyObj<InvestmentService>;
  let router: jasmine.SpyObj<Router>;

  const mockUserProfile = {
    clienteId: 1,
    nome: 'João Silva',
    email: 'joao@example.com',
    pontuacao: 25,
    perfilRisco: {
      id: 1,
      name: 'Conservador',
      description: 'Perfil conservador'
    }
  };

  const mockProducts = [
    {
      id: 1,
      nome: 'Poupança Caixa',
      tipo: 'Poupança',
      taxaAnual: 6.17,
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
      taxaAnual: 9.5,
      liquidez: '90 dias',
      aplicacaoMinima: 1000,
      risco: 'Baixo',
      riskProfileId: 1,
      descricao: 'Isento de IR'
    },
    {
      id: 3,
      nome: 'Ações Petrobras',
      tipo: 'Renda Variável',
      taxaAnual: 15.0,
      liquidez: 'D+2',
      aplicacaoMinima: 100,
      risco: 'Alto',
      riskProfileId: 3,
      descricao: 'Alto potencial'
    },
    {
      id: 4,
      nome: 'CDB Banco',
      tipo: 'Renda Fixa',
      taxaAnual: 12.0,
      liquidez: '180 dias',
      aplicacaoMinima: 500,
      risco: 'Médio',
      riskProfileId: 2,
      descricao: 'Risco moderado'
    },
    {
      id: 5,
      nome: 'Tesouro Selic',
      tipo: 'Tesouro Direto',
      taxaAnual: 10.5,
      liquidez: 'D+1',
      aplicacaoMinima: 30,
      risco: 'Baixo',
      riskProfileId: 1,
      descricao: 'Baixíssimo risco'
    },
    {
      id: 6,
      nome: 'Fundo Multimercado',
      tipo: 'Fundos',
      taxaAnual: 11.8,
      liquidez: 'D+30',
      aplicacaoMinima: 1000,
      risco: 'Médio',
      riskProfileId: 2,
      descricao: 'Diversificado'
    }
  ];

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getStoredClientId',
      'getUserProfile'
    ]);

    const investmentServiceSpy = jasmine.createSpyObj('InvestmentService', [
      'getProducts'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProdutosComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: InvestmentService, useValue: investmentServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideRouter([]),
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    investmentService = TestBed.inject(InvestmentService) as jasmine.SpyObj<InvestmentService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(ProdutosComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.selectedType).toBe('Todos');
      expect(component.productTypes).toEqual(['Todos', 'Poupança', 'Renda Variável', 'Renda Fixa', 'Tesouro Direto', 'Fundos', 'LCI']);
      expect(component.userRiskProfileId).toBeNull();
      expect(component.clienteId).toBeNull();
      expect(component.isLoading).toBe(false);
      expect(component.allProducts).toEqual([]);
      expect(component.filteredProducts).toEqual([]);
      expect(component.recommendedProducts).toEqual([]);
    });

    it('should load user profile and products on init', () => {
      authService.getStoredClientId.and.returnValue(1);
      authService.getUserProfile.and.returnValue(of(mockUserProfile));
      investmentService.getProducts.and.returnValue(of(mockProducts));

      component.ngOnInit();

      expect(authService.getStoredClientId).toHaveBeenCalled();
      expect(component.clienteId).toBe(1);
      expect(authService.getUserProfile).toHaveBeenCalledWith(1);
      expect(investmentService.getProducts).toHaveBeenCalled();
    });

    it('should handle missing clientId gracefully', () => {
      authService.getStoredClientId.and.returnValue(null);
      spyOn(console, 'error');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalledWith('Cliente ID não encontrado');
      expect(component.isLoading).toBe(false);
      expect(authService.getUserProfile).not.toHaveBeenCalled();
    });

    it('should load products even if user profile fails', () => {
      authService.getStoredClientId.and.returnValue(1);
      authService.getUserProfile.and.returnValue(throwError(() => new Error('Profile error')));
      investmentService.getProducts.and.returnValue(of(mockProducts));
      spyOn(console, 'error');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalledWith('Erro ao carregar perfil do usuário:', jasmine.any(Error));
      expect(investmentService.getProducts).toHaveBeenCalled();
    });
  });

  describe('loadProducts', () => {
    it('should load all products successfully', () => {
      investmentService.getProducts.and.returnValue(of(mockProducts));

      component.loadProducts();

      expect(component.allProducts).toEqual(mockProducts);
      expect(component.originalProducts).toEqual(mockProducts);
      expect(component.filteredProducts).toEqual(mockProducts);
      expect(component.isLoading).toBe(false);
    });

    it('should handle products loading error', () => {
      const error = new Error('Network error');
      investmentService.getProducts.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.loadProducts();

      expect(console.error).toHaveBeenCalledWith('Erro ao carregar produtos:', error);
      expect(component.isLoading).toBe(false);
    });

    it('should call loadRecommendedProducts after loading products', () => {
      investmentService.getProducts.and.returnValue(of(mockProducts));
      spyOn(component, 'loadRecommendedProducts');

      component.loadProducts();

      expect(component.loadRecommendedProducts).toHaveBeenCalled();
    });
  });

  describe('loadRecommendedProducts', () => {
    beforeEach(() => {
      component.allProducts = mockProducts;
    });

    it('should return empty array if no risk profile', () => {
      component.userRiskProfileId = null;

      component.loadRecommendedProducts();

      expect(component.recommendedProducts).toEqual([]);
    });

    it('should filter products by user risk profile', () => {
      component.userRiskProfileId = 1; // Conservador

      component.loadRecommendedProducts();

      expect(component.recommendedProducts.length).toBe(3);
      expect(component.recommendedProducts.every(p => p.riskProfileId === 1)).toBe(true);
    });

    it('should sort recommended products by taxaAnual descending', () => {
      component.userRiskProfileId = 1;

      component.loadRecommendedProducts();

      expect(component.recommendedProducts[0].taxaAnual).toBeGreaterThanOrEqual(
        component.recommendedProducts[1].taxaAnual
      );
      expect(component.recommendedProducts[1].taxaAnual).toBeGreaterThanOrEqual(
        component.recommendedProducts[2].taxaAnual
      );
    });

    it('should limit to top 3 products', () => {
      component.userRiskProfileId = 1;

      component.loadRecommendedProducts();

      expect(component.recommendedProducts.length).toBeLessThanOrEqual(3);
    });

    it('should handle risk profile with no matching products', () => {
      component.userRiskProfileId = 999;

      component.loadRecommendedProducts();

      expect(component.recommendedProducts).toEqual([]);
    });

    it('should handle risk profile with less than 3 products', () => {
      component.allProducts = [mockProducts[2]]; // Only one product with riskProfileId 3
      component.userRiskProfileId = 3;

      component.loadRecommendedProducts();

      expect(component.recommendedProducts.length).toBe(1);
    });
  });

  describe('filterByType', () => {
    beforeEach(() => {
      component.originalProducts = mockProducts;
      component.filteredProducts = mockProducts;
    });

    it('should show all products when "Todos" is selected', () => {
      component.filterByType('Todos');

      expect(component.selectedType).toBe('Todos');
      expect(component.filteredProducts).toEqual(mockProducts);
    });

    it('should filter products by Poupança', () => {
      component.filterByType('Poupança');

      expect(component.selectedType).toBe('Poupança');
      expect(component.filteredProducts.length).toBe(1);
      expect(component.filteredProducts[0].tipo).toBe('Poupança');
    });

    it('should filter products by Renda Variável', () => {
      component.filterByType('Renda Variável');

      expect(component.selectedType).toBe('Renda Variável');
      expect(component.filteredProducts.length).toBe(1);
      expect(component.filteredProducts[0].tipo).toBe('Renda Variável');
    });

    it('should filter products by Renda Fixa', () => {
      component.filterByType('Renda Fixa');

      expect(component.selectedType).toBe('Renda Fixa');
      expect(component.filteredProducts.length).toBe(1);
      expect(component.filteredProducts[0].tipo).toBe('Renda Fixa');
    });

    it('should filter products by Tesouro Direto', () => {
      component.filterByType('Tesouro Direto');

      expect(component.selectedType).toBe('Tesouro Direto');
      expect(component.filteredProducts.length).toBe(1);
      expect(component.filteredProducts[0].tipo).toBe('Tesouro Direto');
    });

    it('should filter products by Fundos', () => {
      component.filterByType('Fundos');

      expect(component.selectedType).toBe('Fundos');
      expect(component.filteredProducts.length).toBe(1);
      expect(component.filteredProducts[0].tipo).toBe('Fundos');
    });

    it('should filter products by LCI', () => {
      component.filterByType('LCI');

      expect(component.selectedType).toBe('LCI');
      expect(component.filteredProducts.length).toBe(1);
      expect(component.filteredProducts[0].tipo).toBe('LCI');
    });

    it('should return empty array for non-existent type', () => {
      component.filterByType('Tipo Inexistente');

      expect(component.selectedType).toBe('Tipo Inexistente');
      expect(component.filteredProducts).toEqual([]);
    });

    it('should not modify originalProducts', () => {
      const originalCopy = [...mockProducts];
      
      component.filterByType('Poupança');

      expect(component.originalProducts).toEqual(originalCopy);
    });
  });

  describe('getRiskClass', () => {
    it('should convert "Baixo" to lowercase without accents', () => {
      expect(component.getRiskClass('Baixo')).toBe('baixo');
    });

    it('should convert "Médio" to lowercase without accents', () => {
      expect(component.getRiskClass('Médio')).toBe('medio');
    });

    it('should convert "Alto" to lowercase without accents', () => {
      expect(component.getRiskClass('Alto')).toBe('alto');
    });

    it('should handle mixed case', () => {
      expect(component.getRiskClass('BaIxO')).toBe('baixo');
    });

    it('should handle accented characters', () => {
      expect(component.getRiskClass('médio')).toBe('medio');
    });
  });

  describe('getRiskIcon', () => {
    it('should return "shield" for "Baixo"', () => {
      expect(component.getRiskIcon('Baixo')).toBe('shield');
    });

    it('should return "shield" for "baixo"', () => {
      expect(component.getRiskIcon('baixo')).toBe('shield');
    });

    it('should return "balance" for "Médio"', () => {
      expect(component.getRiskIcon('Médio')).toBe('balance');
    });

    it('should return "balance" for "medio"', () => {
      expect(component.getRiskIcon('medio')).toBe('balance');
    });

    it('should return "rocket_launch" for "Alto"', () => {
      expect(component.getRiskIcon('Alto')).toBe('rocket_launch');
    });

    it('should return "rocket_launch" for "alto"', () => {
      expect(component.getRiskIcon('alto')).toBe('rocket_launch');
    });

    it('should return "show_chart" for unknown risk', () => {
      expect(component.getRiskIcon('Desconhecido')).toBe('show_chart');
    });

    it('should handle partial matches for baixo', () => {
      expect(component.getRiskIcon('Risco Baixo')).toBe('shield');
    });

    it('should handle partial matches for médio', () => {
      expect(component.getRiskIcon('Risco Médio')).toBe('balance');
    });

    it('should handle partial matches for alto', () => {
      expect(component.getRiskIcon('Risco Alto')).toBe('rocket_launch');
    });
  });

  describe('simulateInvestment', () => {
    it('should navigate to simulacao with product details', () => {
      const product = mockProducts[0];
      spyOn(console, 'log');

      component.simulateInvestment(product);

      expect(console.log).toHaveBeenCalledWith('Simulating investment for:', product);
      expect(router.navigate).toHaveBeenCalledWith(['/simulacao'], {
        queryParams: {
          productId: product.id,
          productName: product.nome
        }
      });
    });

    it('should handle different products', () => {
      const product = mockProducts[2];

      component.simulateInvestment(product);

      expect(router.navigate).toHaveBeenCalledWith(['/simulacao'], {
        queryParams: {
          productId: 3,
          productName: 'Ações Petrobras'
        }
      });
    });

    it('should navigate with correct query params for each product', () => {
      mockProducts.forEach(product => {
        component.simulateInvestment(product);

        expect(router.navigate).toHaveBeenCalledWith(['/simulacao'], {
          queryParams: {
            productId: product.id,
            productName: product.nome
          }
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty products array', () => {
      component.allProducts = [];
      component.originalProducts = [];

      component.filterByType('Todos');

      expect(component.filteredProducts).toEqual([]);
    });

    it('should handle products with same taxaAnual for recommendations', () => {
      const productsWithSameRate = [
        { ...mockProducts[0], taxaAnual: 10.0, riskProfileId: 1 },
        { ...mockProducts[1], taxaAnual: 10.0, riskProfileId: 1 },
        { ...mockProducts[4], taxaAnual: 10.0, riskProfileId: 1 }
      ];
      component.allProducts = productsWithSameRate;
      component.userRiskProfileId = 1;

      component.loadRecommendedProducts();

      expect(component.recommendedProducts.length).toBe(3);
    });

    it('should handle null values in risk string', () => {
      expect(component.getRiskIcon('')).toBe('show_chart');
    });

    it('should maintain filter after multiple type changes', () => {
      component.originalProducts = mockProducts;

      component.filterByType('Poupança');
      expect(component.filteredProducts.length).toBe(1);

      component.filterByType('LCI');
      expect(component.filteredProducts.length).toBe(1);

      component.filterByType('Todos');
      expect(component.filteredProducts.length).toBe(mockProducts.length);
    });

    it('should handle concurrent filter operations', () => {
      component.originalProducts = mockProducts;

      component.filterByType('Renda Fixa');
      const firstFilter = component.filteredProducts.length;

      component.filterByType('Renda Variável');
      const secondFilter = component.filteredProducts.length;

      expect(firstFilter).toBe(1);
      expect(secondFilter).toBe(1);
      expect(component.filteredProducts[0].tipo).toBe('Renda Variável');
    });
  });

  describe('Integration Tests', () => {
    it('should complete full initialization flow', () => {
      authService.getStoredClientId.and.returnValue(1);
      authService.getUserProfile.and.returnValue(of(mockUserProfile));
      investmentService.getProducts.and.returnValue(of(mockProducts));

      component.ngOnInit();

      expect(component.clienteId).toBe(1);
      expect(component.userRiskProfileId).toBe(1);
      expect(component.allProducts.length).toBe(6);
      expect(component.recommendedProducts.length).toBeLessThanOrEqual(3);
      expect(component.filteredProducts.length).toBe(6);
    });

    it('should filter and simulate investment flow', () => {
      component.originalProducts = mockProducts;
      component.filteredProducts = mockProducts;

      component.filterByType('LCI');
      expect(component.filteredProducts.length).toBe(1);

      const selectedProduct = component.filteredProducts[0];
      component.simulateInvestment(selectedProduct);

      expect(router.navigate).toHaveBeenCalledWith(['/simulacao'], {
        queryParams: {
          productId: selectedProduct.id,
          productName: selectedProduct.nome
        }
      });
    });

    it('should handle complete error scenario', () => {
      authService.getStoredClientId.and.returnValue(1);
      authService.getUserProfile.and.returnValue(throwError(() => new Error('Profile error')));
      investmentService.getProducts.and.returnValue(throwError(() => new Error('Products error')));
      spyOn(console, 'error');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalledTimes(2);
      expect(component.isLoading).toBe(false);
    });
  });
});
