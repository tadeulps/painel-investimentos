import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CaixaButtonComponent } from '../caixa-button/caixa-button.component';

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
  templateUrl: './confirm-investment-dialog.component.html',
  styleUrls: ['./confirm-investment-dialog.component.scss']
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
