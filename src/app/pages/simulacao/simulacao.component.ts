import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InvestmentService, Product } from '../../services/investment.service';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';

interface MonthlyDetail {
  mes: number;
  saldo: number;
  rendimento: number;
}

interface SimulationResult {
  valorInicial: number;
  valorFinal: number;
  rendimentoTotal: number;
  prazoMeses: number;
  detalheMensal: MonthlyDetail[];
}

@Component({
  selector: 'app-simulacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule
  ],
  templateUrl: './simulacao.component.html',
  styleUrls: ['./simulacao.component.scss']
})
export class SimulacaoComponent implements OnInit {
  simulationForm: FormGroup;
  selectedProduct: Product | null = null;
  currentProductIndex = 0;
  simulationResult: SimulationResult | null = null;
  isLoading = false;
  isInvesting = false;
  clienteId: number | null = null;

  availableProducts: Product[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private investmentService: InvestmentService,
    private authService: AuthService
  ) {
    this.simulationForm = this.fb.group({
      valor: [null, [Validators.required, Validators.min(100)]],
      prazoMeses: [null, [Validators.required, Validators.min(1), Validators.max(360)]]
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.clienteId = this.authService.getStoredClientId();

    // Load products from API
    this.investmentService.getProducts().subscribe({
      next: (products) => {
        this.availableProducts = products;
        this.isLoading = false;

        // Check for productId in query params after loading products
        this.route.queryParams.subscribe(params => {
          const productId = params['productId'];
          if (productId) {
            const product = this.availableProducts.find(p => p.id === +productId);
            if (product) {
              this.selectedProduct = product;
            }
          }
        });
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.isLoading = false;
      }
    });
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
  }

  previousProduct(): void {
    if (this.currentProductIndex > 0) {
      this.currentProductIndex--;
    }
  }

  nextProduct(): void {
    if (this.currentProductIndex < this.availableProducts.length - 1) {
      this.currentProductIndex++;
    }
  }

  goToProduct(index: number): void {
    this.currentProductIndex = index;
  }

  changeProduct(): void {
    this.selectedProduct = null;
    this.simulationResult = null;
    this.simulationForm.reset();
  }

  getRiskClass(risco: string): string {
    return risco.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  simulate(): void {
    if (this.simulationForm.invalid || !this.selectedProduct) {
      return;
    }

    const valor = this.simulationForm.value.valor;
    const prazoMeses = this.simulationForm.value.prazoMeses;
    const taxaAnual = this.selectedProduct.taxaAnual;
    const taxaMensal = Math.pow(1 + taxaAnual, 1/12) - 1;

    // Calculate monthly breakdown
    const detalheMensal: MonthlyDetail[] = [];
    let saldoAtual = valor;

    for (let mes = 1; mes <= prazoMeses; mes++) {
      const rendimentoMes = saldoAtual * taxaMensal;
      saldoAtual += rendimentoMes;

      detalheMensal.push({
        mes,
        saldo: saldoAtual,
        rendimento: rendimentoMes
      });
    }

    const valorFinal = saldoAtual;
    const rendimentoTotal = valorFinal - valor;

    this.simulationResult = {
      valorInicial: valor,
      valorFinal,
      rendimentoTotal,
      prazoMeses,
      detalheMensal
    };

    // Scroll to results
    setTimeout(() => {
      document.querySelector('.simulation-results-section')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  }

  newSimulation(): void {
    this.simulationResult = null;
    this.simulationForm.reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  proceedToInvest(): void {
    if (!this.selectedProduct || !this.simulationResult || !this.clienteId) {
      alert('Erro: Dados incompletos para realizar o investimento.');
      return;
    }

    this.isInvesting = true;

    this.investmentService.createInvestment(
      this.clienteId,
      this.selectedProduct.id,
      this.simulationResult.valorInicial,
      this.simulationResult.prazoMeses
    ).subscribe({
      next: (response) => {
        this.isInvesting = false;
        alert(`Investimento realizado com sucesso!\n\nProduto: ${this.selectedProduct!.nome}\nValor: R$ ${this.simulationResult!.valorInicial.toFixed(2)}\nPrazo: ${this.simulationResult!.prazoMeses} meses`);
        
        // Navigate to dashboard to see investments
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isInvesting = false;
        console.error('Erro ao criar investimento:', error);
        alert('Erro ao processar investimento. Tente novamente.');
      }
    });
  }
}
