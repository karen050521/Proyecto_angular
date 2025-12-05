import { Injectable, signal } from '@angular/core';
import { Address } from '../models/address.model';

/**
 * Servicio para gestionar el modal de selección de dirección
 */
@Injectable({
  providedIn: 'root'
})
export class AddressSelectorService {
  private isOpenSignal = signal(false);
  private selectedAddressSignal = signal<Address | null>(null);
  private resolveCallback: ((address: Address | null) => void) | null = null;

  /**
   * Obtener el estado de apertura del modal (solo lectura)
   */
  getIsOpen() {
    return this.isOpenSignal.asReadonly();
  }

  /**
   * Obtener la dirección seleccionada (solo lectura)
   */
  getSelectedAddress() {
    return this.selectedAddressSignal.asReadonly();
  }

  /**
   * Abrir el modal y esperar selección de dirección
   * @returns Promise que se resuelve con la dirección seleccionada o null si se cancela
   */
  async open(): Promise<Address | null> {
    this.isOpenSignal.set(true);
    this.selectedAddressSignal.set(null);

    return new Promise((resolve) => {
      this.resolveCallback = resolve;
    });
  }

  /**
   * Confirmar selección de dirección
   */
  selectAddress(address: Address): void {
    this.selectedAddressSignal.set(address);
    this.isOpenSignal.set(false);
    
    if (this.resolveCallback) {
      this.resolveCallback(address);
      this.resolveCallback = null;
    }
  }

  /**
   * Cerrar el modal sin seleccionar
   */
  close(): void {
    this.isOpenSignal.set(false);
    this.selectedAddressSignal.set(null);
    
    if (this.resolveCallback) {
      this.resolveCallback(null);
      this.resolveCallback = null;
    }
  }
}
