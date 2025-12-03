import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartStore } from '../../../core/services/cart.store';

@Component({
  selector: 'app-cart-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-icon.html',
  styleUrl: './cart-icon.css'
})
export class CartIconComponent {
  private router = inject(Router);
  cartStore = inject(CartStore);
  
  goToCart(): void {
    // Abrir el sidebar en lugar de navegar
    this.cartStore.openSidebar();
  }
}
