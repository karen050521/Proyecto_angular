import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartStore } from '../../../core/services/cart.store';
import { CheckoutService } from '../../../core/services/checkout.service';
import { OrderConfirmationService } from '../../../core/services/order-confirmation.service';
import { NotificationService } from '../../../core/services/notification.service';

/**
 * CartSidebar Component - Responsabilidad única: UI del carrito
 * 
 * SRP: Single Responsibility Principle
 * - Solo maneja la visualización y eventos de UI del sidebar del carrito
 * - Delega lógica de negocio a servicios especializados
 * - No maneja navegación directa (solo cierra sidebar)
 */
@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-sidebar.html',
  styleUrl: './cart-sidebar.css'
})
export class CartSidebar {
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  private confirmationService = inject(OrderConfirmationService);
  private notificationService = inject(NotificationService);
  
  // Servicios públicos para el template
  cartStore = inject(CartStore);

  closeSidebar(): void {
    this.cartStore.closeSidebar();
  }

  increaseQuantity(itemId: string): void {
    const item = this.cartStore.items().find(i => i.id === itemId);
    if (item) {
      this.cartStore.updateQuantity(itemId, item.quantity + 1);
    }
  }

  decreaseQuantity(itemId: string): void {
    const item = this.cartStore.items().find(i => i.id === itemId);
    if (item && item.quantity > 1) {
      this.cartStore.updateQuantity(itemId, item.quantity - 1);
    }
  }

  removeItem(itemId: string): void {
    this.cartStore.removeItem(itemId);
  }

  clearCart(): void {
    if (this.notificationService.confirm('¿Estás seguro de vaciar el carrito?')) {
      this.cartStore.clearCart();
    }
  }

  checkout(): void {
    const items = this.cartStore.items();
    
    // Validar carrito
    const validation = this.checkoutService.validateCart(items);
    if (!validation.valid) {
      this.notificationService.showError(validation.message || 'Error en el carrito');
      return;
    }
    
    // Confirmar con el usuario
    const confirmed = this.notificationService.confirm(
      `¿Confirmar orden de ${items.length} producto(s) por $${this.cartStore.total()}?`
    );
    
    if (!confirmed) {
      return;
    }
    
    // Procesar checkout usando el servicio
    this.checkoutService.processCheckout(items).subscribe({
      next: (orders) => {
        // Calcular el total y la cantidad de productos desde los items del carrito
        const total = items.reduce((sum, item) => sum + item.subtotal, 0);
        const totalProducts = items.reduce((sum, item) => sum + item.quantity, 0);
        
        // Limpiar carrito y cerrar sidebar
        this.cartStore.clearCart();
        this.closeSidebar();
        
        // Mostrar modal de confirmación con datos correctos
        // Guardamos el ID de la primera orden para el tracking
        const firstOrderId = orders[0]?.id || null;
        this.confirmationService.showConfirmation(totalProducts, total, firstOrderId);
      },
      error: (err) => {
        this.notificationService.showError('Error al generar la orden. Por favor intenta de nuevo.');
      }
    });
  }
  
  backToMenu(): void {
    const items = this.cartStore.items();
    if (items.length > 0) {
      const restaurantId = items[0].restaurant_id;
      this.closeSidebar();
      this.router.navigate(['/restaurantes', restaurantId, 'menu']);
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeSidebar();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeSidebar();
    }
  }
}
