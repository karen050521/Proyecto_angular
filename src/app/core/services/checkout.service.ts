import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, switchMap, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderService } from './order.service';
import { MotorcycleService } from './motorcycle.service';
import { NotificationService } from './notification.service';
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
  private motorcycleService = inject(MotorcycleService);
  private notificationService = inject(NotificationService);
  
  // Customer ID hardcoded (TODO: integrar con sistema de autenticación)
  private readonly DEFAULT_CUSTOMER_ID = 1;
  
  /**
   * Procesa el checkout creando múltiples órdenes (una por cada item del carrito)
   * y asigna un repartidor disponible
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
    
    // Primero asignar un repartidor disponible
    return this.motorcycleService.assignRandomDriver().pipe(
      tap(assignedDriver => {
        console.log('🚚 Repartidor asignado:', assignedDriver);
      }),
      switchMap(assignedDriver => {
        // Crear payloads para cada item
        const orderPayloads: OrderCreatePayload[] = items.map(item => ({
          customer_id: effectiveCustomerId,
          menu_id: item.menu_id,
          motorcycle_id: assignedDriver?.id, // Asignar el repartidor
          quantity: item.quantity,
          total_price: item.subtotal,
          status: 'pending' as const
        }));
        
        console.log('📦 Creando órdenes:', orderPayloads);
        
        // Crear todas las órdenes en paralelo
        const orderRequests = orderPayloads.map(payload => 
          this.orderService.create(payload)
        );
        
        return forkJoin(orderRequests).pipe(
          tap(orders => {
            console.log('✅ Órdenes creadas:', orders);
            console.log('📊 Estructura de órdenes:', {
              length: orders.length,
              firstOrder: orders[0],
              firstOrderId: orders[0]?.id,
              isArray: Array.isArray(orders[0])
            });
            
            // Aplanar el array si es necesario
            const flatOrders = Array.isArray(orders[0]) ? orders[0] : orders;
            const firstValidOrder = flatOrders[0];
            
            // Crear notificación cuando se asigna el pedido
            if (assignedDriver && flatOrders.length > 0 && firstValidOrder?.id) {
              const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
              const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);
              const driverName = assignedDriver.driver_name || `Conductor #${assignedDriver.id}`;
              
              console.log('🔔 Creando notificación:', {
                orderId: firstValidOrder.id,
                driverName,
                details: `${totalItems} productos - $${totalPrice.toFixed(2)}`
              });
              
              this.notificationService.addOrderNotification(
                firstValidOrder.id,
                driverName,
                `${totalItems} productos - $${totalPrice.toFixed(2)}`
              );
            } else {
              console.warn('⚠️ No se creó notificación:', { 
                hasDriver: !!assignedDriver, 
                hasOrders: flatOrders.length > 0,
                hasOrderId: !!firstValidOrder?.id,
                firstValidOrder
              });
            }
          })
        );
      })
    );
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
