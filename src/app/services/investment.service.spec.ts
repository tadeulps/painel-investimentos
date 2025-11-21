import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InvestmentService } from './investment.service';
import { Product, Investment, SimulationRequest, SimulationResponse } from '../models/investment.models';

describe('InvestmentService', () => {
  let service: InvestmentService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InvestmentService]
    });

    service = TestBed.inject(InvestmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('getProducts', () => {
    const mockProducts: Product[] = [
      {
        id: 1,
        nome: 'Poupança',
        tipo: 'Renda Fixa',
        taxaAnual: 6.17,
        risco: 'Baixo',
        aplicacaoMinima: 50,
        liquidez: 'Imediata',
        riskProfileId: 1
      },
      {
        id: 2,
        nome: 'CDB',
        tipo: 'Renda Fixa',
        taxaAnual: 10.5,
        risco: 'Médio',
        aplicacaoMinima: 1000,
        liquidez: '90 dias',
        riskProfileId: 2
      }
    ];

    it('should send GET request to products endpoint', () => {
      service.getProducts().subscribe();

      const req = httpMock.expectOne(`${apiUrl}/products`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    it('should return array of products', () => {
      service.getProducts().subscribe(products => {
        expect(products).toEqual(mockProducts);
        expect(products.length).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/products`);
      req.flush(mockProducts);
    });

    it('should handle empty products array', () => {
      service.getProducts().subscribe(products => {
        expect(products).toEqual([]);
      });

      const req = httpMock.expectOne(`${apiUrl}/products`);
      req.flush([]);
    });
  });

  describe('getProductsByRiskProfile', () => {
    const mockProducts: Product[] = [
      {
        id: 1,
        nome: 'Poupança',
        tipo: 'Renda Fixa',
        taxaAnual: 6.17,
        risco: 'Baixo',
        aplicacaoMinima: 50,
        liquidez: 'Imediata',
        riskProfileId: 1
      }
    ];

    it('should send GET request with riskProfileId parameter', () => {
      service.getProductsByRiskProfile(1).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/products?riskProfileId=1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    it('should return filtered products', () => {
      service.getProductsByRiskProfile(2).subscribe(products => {
        expect(products).toEqual(mockProducts);
      });

      const req = httpMock.expectOne(`${apiUrl}/products?riskProfileId=2`);
      req.flush(mockProducts);
    });
  });

  describe('getProduct', () => {
    const mockProduct: Product = {
      id: 1,
      nome: 'Poupança',
      tipo: 'Renda Fixa',
      taxaAnual: 6.17,
      risco: 'Baixo',
      aplicacaoMinima: 50,
      liquidez: 'Imediata',
      riskProfileId: 1
    };

    it('should send GET request to specific product endpoint', () => {
      service.getProduct(1).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/products/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });

    it('should return single product', () => {
      service.getProduct(1).subscribe(product => {
        expect(product).toEqual(mockProduct);
      });

      const req = httpMock.expectOne(`${apiUrl}/products/1`);
      req.flush(mockProduct);
    });
  });

  describe('getUserInvestments', () => {
    const mockInvestments: Investment[] = [
      {
        id: 1,
        userId: 1,
        productId: 1,
        valor: 1000,
        dataInicio: '2024-01-01',
        prazoMeses: 12,
        valorAtual: 1100
      }
    ];

    it('should send GET request to user investments endpoint', () => {
      service.getUserInvestments(1).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/investimentos/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockInvestments);
    });

    it('should return array of investments', () => {
      service.getUserInvestments(1).subscribe(investments => {
        expect(investments).toEqual(mockInvestments);
      });

      const req = httpMock.expectOne(`${apiUrl}/investimentos/1`);
      req.flush(mockInvestments);
    });
  });

  describe('simulateInvestment', () => {
    const mockRequest: SimulationRequest = {
      valorInicial: 1000,
      prazoMeses: 12,
      produtoId: 1
    };

    const mockResponse: SimulationResponse = {
      valorInicial: 1000,
      valorFinal: 1100,
      rendimentoTotal: 100,
      prazoMeses: 12,
      produto: {
        id: 1,
        nome: 'Poupança',
        tipo: 'Renda Fixa',
        taxaAnual: 6.17,
        risco: 'Baixo',
        aplicacaoMinima: 50,
        liquidez: 'Imediata',
        riskProfileId: 1
      },
      detalheMensal: [
        { mes: 1, saldo: 1008, rendimento: 8 },
        { mes: 2, saldo: 1016, rendimento: 8 }
      ]
    };

    it('should send POST request to simulate endpoint', () => {
      service.simulateInvestment(mockRequest).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/simular-investimento`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockResponse);
    });

    it('should return simulation response', () => {
      service.simulateInvestment(mockRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/simular-investimento`);
      req.flush(mockResponse);
    });
  });

  describe('createInvestment', () => {
    it('should send POST request to create investment', () => {
      service.createInvestment(1, 1, 1000, 12).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/investimentos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        clienteId: 1,
        productId: 1,
        valor: 1000,
        prazoMeses: 12
      });
      req.flush({ success: true });
    });

    it('should handle successful creation', () => {
      service.createInvestment(1, 2, 5000, 24).subscribe(response => {
        expect(response.success).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/investimentos`);
      req.flush({ success: true });
    });
  });

  describe('getPontuacaoHistory', () => {
    const mockHistory = {
      clienteId: 1,
      totalEntries: 1,
      history: [
        {
          id: 1,
          clienteId: 1,
          pontuacao: 50,
          riskProfileId: 2,
          riskProfileName: 'Moderado',
          timestamp: '2024-01-01T00:00:00Z'
        }
      ]
    };

    it('should send GET request to pontuacao history endpoint', () => {
      service.getPontuacaoHistory(1).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/pontuacao-history/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });

    it('should return pontuacao history', () => {
      service.getPontuacaoHistory(1).subscribe(history => {
        expect(history).toEqual(mockHistory);
      });

      const req = httpMock.expectOne(`${apiUrl}/pontuacao-history/1`);
      req.flush(mockHistory);
    });
  });
});