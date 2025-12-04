import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartStore } from '../../core/services/cart.store';
import { CartItem } from '../../core/models/cart-item.model';

@Component({
  selector: 'app-cart-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-view.html',
  styleUrl: './cart-view.css'
})
export class CartViewComponent {
  private router = inject(Router);
  cartStore = inject(CartStore);
  
  incrementQuantity(itemId: string): void {
    const item = this.cartStore.items().find(i => i.id === itemId);
    if (item) {
      this.cartStore.updateQuantity(itemId, item.quantity + 1);
    }
  }
  
  decrementQuantity(itemId: string): void {
    const item = this.cartStore.items().find(i => i.id === itemId);
    if (item) {
      this.cartStore.updateQuantity(itemId, item.quantity - 1);
    }
  }
  
  removeItem(itemId: string): void {
    if (confirm('¿Eliminar este producto del carrito?')) {
      this.cartStore.removeItem(itemId);
    }
  }
  
  clearCart(): void {
    if (confirm('¿Vaciar todo el carrito de compras?')) {
      this.cartStore.clearCart();
    }
  }
  
  goToMenu(restaurantId: number): void {
    this.router.navigate(['/menu', restaurantId]);
  }
  
  checkout(): void {
    // TODO: Implementar checkout
    alert('🚧 Checkout en construcción...\n\nTotal: $' + this.cartStore.total());
  }
  
  getImageUrl(item: CartItem): string {
    return item.product_image || '/assets/placeholder-food.jpg';
  }
  
  hasImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/placeholder-food.jpg';
  }
}
