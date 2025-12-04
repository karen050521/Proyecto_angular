import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderService } from './order.service';
import { Order, OrderCreatePayload } from '../models/order.model';
import { CartItem } from '../models/cart-item.model';

/**
 * CheckoutService - Responsabilidad única: procesar el checkout
 * 
 * SRP: Single Responsibility Principle
 * - Solo se encarga de la lógica de negocio de checkout
 * - No maneja UI, navegación ni estado del carrito
 */
@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private orderService = inject(OrderService);
  
  // Customer ID hardcoded (TODO: integrar con sistema de autenticación)
  private readonly DEFAULT_CUSTOMER_ID = 1;
  
  /**
   * Procesa el checkout creando múltiples órdenes (una por cada item del carrito)
   * 
   * @param items Items del carrito a procesar
   * @param customerId ID del cliente (opcional, usa default si no se provee)
   * @returns Observable con array de órdenes creadas
   */
  processCheckout(items: CartItem[], customerId?: number): Observable<Order[]> {
    if (items.length === 0) {
      throw new Error('No hay items en el carrito');
    }
    
    const effectiveCustomerId = customerId || this.DEFAULT_CUSTOMER_ID;
    
    // Crear payloads para cada item
    const orderPayloads: OrderCreatePayload[] = items.map(item => ({
      customer_id: effectiveCustomerId,
      menu_id: item.menu_id,
      quantity: item.quantity,
      total_price: item.subtotal,
      status: 'pending' as const
    }));
    
    // Crear todas las órdenes en paralelo
    const orderRequests = orderPayloads.map(payload => 
      this.orderService.create(payload)
    );
    
    return forkJoin(orderRequests);
  }
  
  /**
   * Calcula el total de las órdenes creadas
   * 
   * @param orders Array de órdenes
   * @returns Total sumado de todas las órdenes
   */
  calculateTotal(orders: Order[]): number {
    return orders.reduce((sum, order) => sum + (order.total_price || 0), 0);
  }
  
  /**
   * Valida que el carrito sea válido para checkout
   * 
   * @param items Items del carrito
   * @returns true si es válido, false si no
   */
  validateCart(items: CartItem[]): { valid: boolean; message?: string } {
    if (items.length === 0) {
      return { valid: false, message: 'El carrito está vacío' };
    }
    
    // Validar que todos los items tengan precio válido
    const invalidItems = items.filter(item => !item.price || item.price <= 0);
    if (invalidItems.length > 0) {
      return { 
        valid: false, 
        message: 'Algunos items tienen precios inválidos' 
      };
    }
    
    // Validar que todos los items tengan cantidad válida
    const invalidQuantities = items.filter(item => !item.quantity || item.quantity <= 0);
    if (invalidQuantities.length > 0) {
      return { 
        valid: false, 
        message: 'Algunos items tienen cantidades inválidas' 
      };
    }
    
    return { valid: true };
  }
}
