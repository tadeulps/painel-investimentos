import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Product,
  Investment,
  SimulationRequest,
  SimulationResponse,
  PontuacaoHistoryEntry,
  PontuacaoHistoryResponse
} from '../models/investment.models';

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
