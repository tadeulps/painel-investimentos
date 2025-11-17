import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface Product {
  id: number;
  nome: string;
  tipo: string;
  rentabilidade: number;
  risco: string;
}

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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './simulacao.component.html',
  styleUrls: ['./simulacao.component.scss']
})
export class SimulacaoComponent implements OnInit {
  simulationForm: FormGroup;
  selectedProduct: Product | null = null;
  currentProductIndex = 0;
  simulationResult: SimulationResult | null = null;

  availableProducts: Product[] = [
    {
      id: 101,
      nome: 'CDB Caixa 2026',
      tipo: 'CDB',
      rentabilidade: 0.13,
      risco: 'Baixo'
    },
    {
      id: 104,
      nome: 'Tesouro IPCA+ 2035',
      tipo: 'Tesouro',
      rentabilidade: 0.14,
      risco: 'Medio'
    },
    {
      id: 106,
      nome: 'Fundo Multimercado Equilibrado',
      tipo: 'Fundo',
      rentabilidade: 0.15,
      risco: 'Medio'
    },
    {
      id: 102,
      nome: 'Fundo Agressivo XPTO',
      tipo: 'Fundo',
      rentabilidade: 0.18,
      risco: 'Alto'
    },
    {
      id: 103,
      nome: 'LCI Imobiliária Premium',
      tipo: 'LCI',
      rentabilidade: 0.11,
      risco: 'Baixo'
    },
    {
      id: 108,
      nome: 'Tesouro Selic 2028',
      tipo: 'Tesouro',
      rentabilidade: 0.10,
      risco: 'Baixo'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.simulationForm = this.fb.group({
      valor: [null, [Validators.required, Validators.min(100)]],
      prazoMeses: [null, [Validators.required, Validators.min(1), Validators.max(360)]]
    });
  }

  ngOnInit(): void {
    // Check for productId in query params
    this.route.queryParams.subscribe(params => {
      const productId = params['productId'];
      if (productId) {
        const product = this.availableProducts.find(p => p.id === +productId);
        if (product) {
          this.selectedProduct = product;
        }
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
    const taxaAnual = this.selectedProduct.rentabilidade;
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
    if (this.selectedProduct) {
      alert(`Investimento em ${this.selectedProduct.nome} será processado!\n\nEsta funcionalidade será implementada na próxima fase.`);
      // TODO: Implement investment flow
    }
  }
}
