import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  nome: string;
  tipo: string;
  taxaAnual: number;
  risco: string;
  aplicacaoMinima: number;
  liquidez: string;
  riskProfileId: number;
}

export interface Investment {
  id: number;
  userId: number;
  productId: number;
  valor: number;
  dataInicio: string;
  prazoMeses: number;
  valorAtual: number;
  produto?: Product;
}

export interface SimulationRequest {
  valorInicial: number;
  prazoMeses: number;
  produtoId: number;
}

export interface SimulationResponse {
  valorInicial: number;
  valorFinal: number;
  rendimentoTotal: number;
  prazoMeses: number;
  produto: Product;
  detalheMensal: {
    mes: number;
    saldo: number;
    rendimento: number;
  }[];
}

export interface PontuacaoHistoryEntry {
  id: number;
  clienteId: number;
  pontuacao: number;
  riskProfileId: number;
  riskProfileName: string;
  timestamp: string;
}

export interface PontuacaoHistoryResponse {
  clienteId: number;
  totalEntries: number;
  history: PontuacaoHistoryEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Get all products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  // Get products by risk profile ID
  getProductsByRiskProfile(riskProfileId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products?riskProfileId=${riskProfileId}`);
  }

  // Get single product by ID
  getProduct(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${productId}`);
  }

  // Get user investments
  getUserInvestments(clienteId: number): Observable<Investment[]> {
    return this.http.get<Investment[]>(`${this.apiUrl}/investimentos/${clienteId}`);
  }

  // Simulate investment
  simulateInvestment(data: SimulationRequest): Observable<SimulationResponse> {
    return this.http.post<SimulationResponse>(`${this.apiUrl}/simular-investimento`, data);
  }

  // Create new investment
  createInvestment(clienteId: number, productId: number, valor: number, prazoMeses: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/investimentos`, {
      clienteId,
      productId,
      valor,
      prazoMeses
    });
  }

  // Get pontuacao history
  getPontuacaoHistory(clienteId: number): Observable<PontuacaoHistoryResponse> {
    return this.http.get<PontuacaoHistoryResponse>(`${this.apiUrl}/pontuacao-history/${clienteId}`);
  }
}
