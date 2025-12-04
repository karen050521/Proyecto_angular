import { Injectable, signal } from '@angular/core';

export interface OrderConfirmation {
  orderCount: number;
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderConfirmationService {
  // ✅ Inicializado en null - No se muestra al cargar la app
  private confirmationData = signal<OrderConfirmation | null>(null);
  
  showConfirmation(orderCount: number, totalAmount: number) {
    this.confirmationData.set({ orderCount, totalAmount });
  }
  
  getConfirmation() {
    return this.confirmationData.asReadonly();
  }
  
  clearConfirmation() {
    this.confirmationData.set(null);
  }
  
  /**
   * Verificar si hay una confirmación activa
   */
  hasActiveConfirmation(): boolean {
    return this.confirmationData() !== null;
  }
}
