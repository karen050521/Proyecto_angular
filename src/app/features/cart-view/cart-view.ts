import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartStore } from '../../core/services/cart.store';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { NotificationService } from '../../core/services/notification.service';
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
  private confirmService = inject(ConfirmationService);
  private notificationService = inject(NotificationService);
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
  
  async removeItem(itemId: string): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Producto',
      message: '¿Eliminar este producto del carrito?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'warning'
    });

    if (confirmed) {
      this.cartStore.removeItem(itemId);
    }
  }
  
  async clearCart(): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Vaciar Carrito',
      message: '¿Vaciar todo el carrito de compras?',
      confirmText: 'Sí, vaciar',
      cancelText: 'Cancelar',
      type: 'warning'
    });

    if (confirmed) {
      this.cartStore.clearCart();
    }
  }
  
  goToMenu(restaurantId: number): void {
    this.router.navigate(['/menu', restaurantId]);
  }
  
  checkout(): void {
    // TODO: Implementar checkout completo
    this.notificationService.showInfo(`Checkout en construcción. Total: $${this.cartStore.total()}`);
  }
  
  getImageUrl(item: CartItem): string {
    return item.product_image || '/assets/placeholder-food.jpg';
  }
  
  hasImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/placeholder-food.jpg';
  }
}
