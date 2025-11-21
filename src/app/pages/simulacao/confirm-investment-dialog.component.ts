import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CaixaButtonComponent } from '../../components/caixa-button/caixa-button.component';

export interface ConfirmInvestmentData {
  productName: string;
  valorInicial: number;
  prazoMeses: number;
  valorFinal: number;
}

@Component({
  selector: 'app-confirm-investment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    CaixaButtonComponent
  ],
  template: `
    <div class="dialog-container">
   
      
      <mat-dialog-content>
        <div class="investment-summary">
          <div class="summary-item">
            <span class="label">Produto:</span>
            <span class="value">{{ data.productName }}</span>
          </div>
          
          <div class="summary-item">
            <span class="label">Valor a Investir:</span>
            <span class="value highlight">{{ data.valorInicial | currency: 'BRL' }}</span>
          </div>
          
          <div class="summary-item">
            <span class="label">Prazo:</span>
            <span class="value">{{ data.prazoMeses }} {{ data.prazoMeses === 1 ? 'mês' : 'meses' }}</span>
          </div>
          
          <div class="summary-item final">
            <span class="label">Valor Final Estimado:</span>
            <span class="value success">{{ data.valorFinal | currency: 'BRL' }}</span>
          </div>
        </div>
        
        <p class="confirmation-text">
          Deseja confirmar este investimento?
        </p>
      </mat-dialog-content>
      
      <mat-dialog-actions>
        <app-caixa-button
          variant="danger"
          icon="close"
          (clicked)="onCancel()"
          [fullWidth]="true"
        >
          Cancelar
        </app-caixa-button>
        
        <app-caixa-button
          variant="secondary"
          icon="check_circle"
          (clicked)="onConfirm()"
          [fullWidth]="true"
        >
          Confirmar 
        </app-caixa-button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    @import "../../../styles/token.scss";

    .dialog-container {
      padding: $spacing-tiny;
      font-family: $font-regular;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: $spacing-nano;
      color: $azul-caixa;
      font-family: $font-semibold !important;
      font-weight: $font-weight-semibold;
      font-size: $heading-small;
      margin: 0;
      padding-bottom: $spacing-tiny;

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    mat-dialog-content {
      padding: $spacing-small 0;
      min-width: 400px;
      
      @media (max-width: 768px) {
        min-width: 280px;
      }
    }

    .investment-summary {
      background: linear-gradient(135deg, $light-blue-highlight, $light-green);
      border-radius: $border-radius-large;
      padding: $spacing-small;
      margin-bottom: $spacing-tiny;
      box-shadow: $shadow-elevation-2;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: $spacing-nano 0;

      &:last-of-type {
        border-bottom: none;
      }

      &.final {
        margin-top: $spacing-nano;
        padding-top: $spacing-tiny;
      }

      .label {
        font-family: $font-regular;
        font-weight: $font-weight-regular;
        font-size: $text-standard;
        color: $charcoal;
      }

      .value {
        font-family: $font-semibold;
        font-weight: $font-weight-semibold;
        font-size: $text-large;
        color: $charcoal;

        &.highlight {
          color: $azul-caixa;
        }

        &.success {
          color: $success-70;
          font-size: $heading-tiny;
        }
      }
    }

    .confirmation-text {
      text-align: center;
      font-family: $font-regular;
      font-size: $text-large;
      color: $slate;
      margin: $spacing-tiny 0 0;
    }
mat-dialog-actions {
  display: flex;
  gap: $spacing-tiny;
  padding: $spacing-tiny 0 0;
  margin: 0;

  app-caixa-button {
    flex: 1;
  }

  button, .mat-mdc-button {
    flex: 1;
  }
}

  `]
})
export class ConfirmInvestmentDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmInvestmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmInvestmentData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
