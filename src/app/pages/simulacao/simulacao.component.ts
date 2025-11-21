import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InvestmentService } from '../../services/investment.service';
import { Product } from '../../models/investment.models';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { CaixaButtonComponent } from '../../components/caixa-button/caixa-button.component';
import { ConfirmInvestmentDialogComponent } from './confirm-investment-dialog.component';

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
    MatTableModule,
    MatDialogModule,
    PageHeaderComponent,
    CaixaButtonComponent
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
  showAllMonths = false;

  availableProducts: Product[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private investmentService: InvestmentService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.simulationForm = this.fb.group({
      valor: [null, [Validators.required, Validators.min(100)]],
      prazoMeses: [null, [Validators.required, Validators.min(1), Validators.max(360)]]
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.clienteId = this.authService.getStoredClientId();

    this.investmentService.getProducts().subscribe({
      next: (products) => {
        this.availableProducts = products;
        this.isLoading = false;

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
    this.showAllMonths = false;
  }

  getRiskClass(risco: string): string {
    return risco.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  getRiskIcon(risco: string): string {
    const riskLower = risco.toLowerCase();
    if (riskLower.includes('baixo')) {
      return 'shield';
    } else if (riskLower.includes('medio') || riskLower.includes('médio')) {
      return 'balance';
    } else if (riskLower.includes('alto')) {
      return 'rocket_launch';
    }
    return 'show_chart';
  }

  simulate(): void {
    if (this.simulationForm.invalid || !this.selectedProduct) {
      return;
    }

    const valor = this.simulationForm.value.valor;
    const prazoMeses = this.simulationForm.value.prazoMeses;
    const taxaAnual = this.selectedProduct.taxaAnual;
    const taxaMensal = Math.pow(1 + taxaAnual, 1/12) - 1;

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

    this.showAllMonths = false;

    setTimeout(() => {
      document.querySelector('.simulation-results-section')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  }

  get displayedMonths(): any[] {
    if (!this.simulationResult) return [];
    
    const months = this.simulationResult.detalheMensal;
    
    if (months.length <= 20 || this.showAllMonths) {
      return months;
    }
    
    const first10 = months.slice(0, 10);
    const last10 = months.slice(-10);
    const separator = { 
      mes: -1, 
      saldo: 0, 
      rendimento: 0,
      isSeparator: true,
      hiddenCount: this.hiddenMonthsCount
    };
    return [...first10, separator, ...last10];
  }

  get shouldShowExpandButton(): boolean {
    return this.simulationResult !== null && 
           this.simulationResult.detalheMensal.length > 20 && 
           !this.showAllMonths;
  }

  get hiddenMonthsCount(): number {
    if (!this.simulationResult) return 0;
    return this.simulationResult.detalheMensal.length - 20;
  }

  toggleShowAllMonths(): void {
    this.showAllMonths = !this.showAllMonths;
  }

  isSeparatorRow(row: any): boolean {
    return row && row.isSeparator === true;
  }

  newSimulation(): void {
    this.simulationResult = null;
    this.simulationForm.reset();
    this.showAllMonths = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  proceedToInvest(): void {
    if (!this.selectedProduct || !this.simulationResult || !this.clienteId) {
      alert('Erro: Dados incompletos para realizar o investimento.');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmInvestmentDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        productName: this.selectedProduct.nome,
        valorInicial: this.simulationResult.valorInicial,
        prazoMeses: this.simulationResult.prazoMeses,
        valorFinal: this.simulationResult.valorFinal
      },
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.confirmInvestment();
      }
    });
  }

  private confirmInvestment(): void {
    if (!this.selectedProduct || !this.simulationResult || !this.clienteId) {
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
