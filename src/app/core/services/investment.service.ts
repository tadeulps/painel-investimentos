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

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  getProductsByRiskProfile(riskProfileId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products?riskProfileId=${riskProfileId}`);
  }

  getProduct(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${productId}`);
  }

  getUserInvestments(clienteId: number): Observable<Investment[]> {
    return this.http.get<Investment[]>(`${this.apiUrl}/investimentos/${clienteId}`);
  }

  simulateInvestment(data: SimulationRequest): Observable<SimulationResponse> {
    return this.http.post<SimulationResponse>(`${this.apiUrl}/simular-investimento`, data);
  }

  createInvestment(clienteId: number, productId: number, valor: number, prazoMeses: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/investimentos`, {
      clienteId,
      productId,
      valor,
      prazoMeses
    });
  }

  getPontuacaoHistory(clienteId: number): Observable<PontuacaoHistoryResponse> {
    return this.http.get<PontuacaoHistoryResponse>(`${this.apiUrl}/pontuacao-history/${clienteId}`);
  }
}
