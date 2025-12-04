import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-orders-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-view.html',
  styleUrl: './orders-view.css'
})
export class OrdersView implements OnInit {
  private orderService = inject(OrderService);

  orders: Order[] = [];
  loading = true;
  error = '';

  // Filtro de estado
  selectedStatus: string = 'all';
  
  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAll().subscribe({
      next: (data) => {
        console.log('Órdenes cargadas:', data);
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar órdenes:', err);
        this.error = 'Error al cargar las órdenes';
        this.loading = false;
      }
    });
  }

  get filteredOrders(): Order[] {
    if (this.selectedStatus === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.status === this.selectedStatus);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'in_progress': 'En proceso',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'status-pending',
      'in_progress': 'status-progress',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return classes[status] || '';
  }

  cancelOrder(orderId: number): void {
    if (!confirm('¿Estás seguro de cancelar esta orden?')) {
      return;
    }

    this.orderService.update(orderId, { status: 'cancelled' }).subscribe({
      next: () => {
        alert('✅ Orden cancelada exitosamente');
        this.loadOrders();
      },
      error: (err) => {
        console.error('Error al cancelar orden:', err);
        alert('❌ Error al cancelar la orden');
      }
    });
  }

  deleteOrder(orderId: number): void {
    if (!confirm('¿Estás seguro de eliminar esta orden? Esta acción no se puede deshacer.')) {
      return;
    }

    this.orderService.delete(orderId).subscribe({
      next: () => {
        alert('✅ Orden eliminada exitosamente');
        this.loadOrders();
      },
      error: (err) => {
        console.error('Error al eliminar orden:', err);
        alert('❌ Error al eliminar la orden');
      }
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
  }

  getTotalOrders(): number {
    return this.orders.length;
  }

  getTotalByStatus(status: string): number {
    return this.orders.filter(o => o.status === status).length;
  }

  getTotalRevenue(): number {
    return this.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total_price, 0);
  }
}
