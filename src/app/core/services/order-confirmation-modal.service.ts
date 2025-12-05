import { Injectable, signal } from '@angular/core';

/**
 * Interfaz para los datos de confirmación de la orden
 */
export interface OrderConfirmationData {
  orderCount: number;
  totalAmount: number;
  orderId: number | null;
}

/**
 * Servicio para gestionar el estado del modal de confirmación de órdenes
 */
@Injectable({
  providedIn: 'root'
})
export class OrderConfirmationService {
  // Signal privado para el estado
  private confirmationSignal = signal<OrderConfirmationData | null>(null);

  /**
   * Obtener el signal de confirmación (solo lectura)
   */
  getConfirmation() {
    return this.confirmationSignal.asReadonly();
  }

  /**
   * Mostrar el modal de confirmación con los datos de la orden
   */
  showConfirmation(orderCount: number, totalAmount: number, orderId: number | null = null): void {
    this.confirmationSignal.set({
      orderCount,
      totalAmount,
      orderId
    });
  }

  /**
   * Limpiar/cerrar el modal de confirmación
   */
  clearConfirmation(): void {
    this.confirmationSignal.set(null);
  }
}
