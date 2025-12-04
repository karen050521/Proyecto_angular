import { Component, inject, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderConfirmationService } from '../../../core/services/order-confirmation.service';

@Component({
  selector: 'app-order-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-confirmation-modal.html',
  styleUrl: './order-confirmation-modal.css'
})
export class OrderConfirmationModal {
  private router = inject(Router);
  private confirmationService = inject(OrderConfirmationService);
  
  // Datos reactivos desde el servicio
  private confirmationData = this.confirmationService.getConfirmation();
  
  // Computados para el template
  visible = computed(() => this.confirmationData() !== null);
  orderCount = computed(() => this.confirmationData()?.orderCount || 0);
  totalAmount = computed(() => this.confirmationData()?.totalAmount || 0);
  orderId = computed(() => this.confirmationData()?.orderId || null);

  /**
   * Cerrar modal con tecla ESC
   */
  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    if (this.visible()) {
      this.close();
    }
  }

  close(): void {
    this.confirmationService.clearConfirmation();
  }

  goToOrders(): void {
    this.close();
    const id = this.orderId();
    if (id) {
      // Redirigir al tracking de la orden específica
      this.router.navigate(['/tracking', id]);
    } else {
      // Si no hay ID, ir a la lista general
      this.router.navigate(['/orders']);
    }
  }

  continueShopping(): void {
    this.close();
    this.router.navigate(['/restaurantes']);
  }
}
