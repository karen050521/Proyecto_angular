import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartStore } from '../../../core/services/cart.store';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-sidebar.html',
  styleUrl: './cart-sidebar.css'
})
export class CartSidebar {
  cartStore = inject(CartStore);
  router = inject(Router);

  closeSidebar() {
    this.cartStore.toggleSidebar();
  }

  increaseQuantity(itemId: string) {
    const item = this.cartStore.items().find(i => i.id === itemId);
    if (item) {
      this.cartStore.updateQuantity(itemId, item.quantity + 1);
    }
  }

  decreaseQuantity(itemId: string) {
    const item = this.cartStore.items().find(i => i.id === itemId);
    if (item && item.quantity > 1) {
      this.cartStore.updateQuantity(itemId, item.quantity - 1);
    }
  }

  removeItem(itemId: string) {
    this.cartStore.removeItem(itemId);
  }

  clearCart() {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      this.cartStore.clearCart();
    }
  }

  checkout() {
    this.closeSidebar();
    // Aquí puedes navegar a la página de checkout si la creas
    // this.router.navigate(['/checkout']);
    alert('Funcionalidad de pago próximamente...');
  }

  // Cerrar al hacer click en el overlay
  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeSidebar();
    }
  }

  // Cerrar con tecla ESC
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeSidebar();
    }
  }
}
