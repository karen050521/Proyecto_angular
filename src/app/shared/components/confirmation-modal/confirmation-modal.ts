import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.css'
})
export class ConfirmationModalComponent {
  // Estado del modal
  private _isOpen = signal(false);
  private _config = signal<ConfirmationConfig | null>(null);
  private _resolveCallback: ((result: boolean) => void) | null = null;

  // Señales públicas (readonly)
  readonly isOpen = this._isOpen.asReadonly();
  readonly config = this._config.asReadonly();

  /**
   * Muestra el modal y retorna una promesa que se resuelve con true/false
   */
  show(config: ConfirmationConfig): Promise<boolean> {
    this._config.set({
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      type: 'warning',
      ...config
    });
    this._isOpen.set(true);

    return new Promise<boolean>((resolve) => {
      this._resolveCallback = resolve;
    });
  }

  /**
   * Confirma la acción
   */
  confirm(): void {
    this._isOpen.set(false);
    if (this._resolveCallback) {
      this._resolveCallback(true);
      this._resolveCallback = null;
    }
  }

  /**
   * Cancela la acción
   */
  cancel(): void {
    this._isOpen.set(false);
    if (this._resolveCallback) {
      this._resolveCallback(false);
      this._resolveCallback = null;
    }
  }

  /**
   * Cierra el modal al hacer clic fuera
   */
  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }

  /**
   * Maneja eventos de teclado (ESC para cancelar)
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cancel();
    }
  }
}
