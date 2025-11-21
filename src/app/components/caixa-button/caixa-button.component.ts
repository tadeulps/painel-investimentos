import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-caixa-button',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './caixa-button.component.html',
  styleUrls: ['./caixa-button.component.scss']
})
export class CaixaButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outlined' | 'danger' = 'primary';
  @Input() disabled: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() icon?: string;
  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
