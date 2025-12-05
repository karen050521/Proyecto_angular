import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartStore } from '../../../core/services/cart.store';
import { CheckoutService } from '../../../core/services/checkout.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { OrderConfirmationService } from '../../../core/services/order-confirmation-modal.service';
import { AddressSelectorService } from '../../../core/services/address-selector.service';
import { AddressSelectorModal } from '../address-selector-modal/address-selector-modal';

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
  imports: [CommonModule, AddressSelectorModal],
  templateUrl: './cart-sidebar.html',
  styleUrl: './cart-sidebar.css'
})
export class CartSidebar {
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  private notificationService = inject(NotificationService);
  private confirmService = inject(ConfirmationService);
  private orderConfirmationService = inject(OrderConfirmationService);
  private addressSelectorService = inject(AddressSelectorService);
  
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

  async clearCart(): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Vaciar Carrito',
      message: '¿Estás seguro de vaciar el carrito?',
      confirmText: 'Sí, vaciar',
      cancelText: 'Cancelar',
      type: 'warning'
    });
    
    if (confirmed) {
      this.cartStore.clearCart();
    }
  }

  async checkout(): Promise<void> {
    const items = this.cartStore.items();
    
    // Validar carrito
    const validation = this.checkoutService.validateCart(items);
    if (!validation.valid) {
      this.notificationService.showError(validation.message || 'Error en el carrito');
      return;
    }
    
    // PASO 1: Seleccionar dirección de entrega
    const selectedAddress = await this.addressSelectorService.open();
    
    if (!selectedAddress) {
      // Usuario canceló la selección de dirección
      return;
    }
    
    // PASO 2: Confirmar con el usuario
    const confirmed = await this.confirmService.confirm({
      title: 'Confirmar Orden',
      message: `¿Confirmar orden de ${items.length} producto(s) por $${this.cartStore.total()}?\n\nDirección de entrega:\n${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}`,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      type: 'info'
    });
    
    if (!confirmed) {
      return;
    }
    
    // PASO 3: Procesar checkout con la dirección seleccionada
    this.checkoutService.processCheckout(items, selectedAddress).subscribe({
      next: (orders) => {
        console.log('✅ Checkout completado:', orders);
        
        // Calcular el total y la cantidad de productos desde los items del carrito
        const total = items.reduce((sum, item) => sum + item.subtotal, 0);
        const totalProducts = items.reduce((sum, item) => sum + item.quantity, 0);
        
        // Limpiar carrito y cerrar sidebar
        this.cartStore.clearCart();
        this.closeSidebar();
        
        // Mostrar modal de confirmación con datos correctos
        const firstOrderId = orders && orders.length > 0 ? orders[0].id : null;
        this.orderConfirmationService.showConfirmation(totalProducts, total, firstOrderId);
      },
      error: (err) => {
        console.error('❌ Error en checkout:', err);
        console.error('❌ Detalles del error:', {
          status: err.status,
          message: err.message,
          error: err.error,
          url: err.url
        });
        this.notificationService.showError(`Error al generar la orden: ${err.error?.message || err.message || 'Error desconocido'}`);
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
