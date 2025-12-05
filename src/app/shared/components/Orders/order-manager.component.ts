import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { CustomerService } from '../../../core/services/customer.service';
import { MotorcycleService } from '../../../core/services/motorcycle.service';
import { MenuService } from '../../../core/services/menu.service';
import { ProductService } from '../../../core/services/product.service';
import { OrderListComponent } from './order-list.component';
import { OrderFormContainerComponent } from './order-form-container.component';

@Component({
  standalone: true,
  selector: 'app-order-manager',
  templateUrl: './order-manager.component.html',
  imports: [CommonModule, OrderListComponent, OrderFormContainerComponent],
  providers: [OrderService, CustomerService, MotorcycleService, MenuService, ProductService]
})
export class OrderManagerComponent implements OnInit {
  orders: any[] = [];
  customers: any[] = [];
  motorcycles: any[] = [];
  menus: any[] = [];
  products: any[] = [];
  loading = false;
  error = '';

  showForm = false;
  editingOrder: any = null;

  ngOnInit(): void {
    this.fetchAll();
  }

  async fetchAll(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      const [
        ordersData,
        customersData,
        motorcyclesData,
        menusData,
        productsData,
      ] = await Promise.all([
        this.orderService.getAll().toPromise(),
        this.customerService.getAll().toPromise(),
        this.motorcycleService.getAll().toPromise(),
        this.menuService.getAll().toPromise(),
        this.productService.getAll().toPromise(),
      ]);
      this.orders = ordersData ?? [];
      this.customers = customersData ?? [];
      this.motorcycles = motorcyclesData ?? [];
      this.menus = menusData ?? [];
      this.products = productsData ?? [];
    } catch (err) {
      this.error = 'Error cargando datos. Intenta nuevamente.';
      console.error(err);
    }
    this.loading = false;

    // IDs duplicados (solo warning en consola)
    if (Array.isArray(this.orders) && this.orders.length > 0) {
      const ids = this.orders.map(o => o.id);
      const duplicates = ids.filter((id, idx) => ids.indexOf(id) !== idx);
      if (duplicates.length) {
        console.warn('⚠️ Se detectaron IDs duplicados:', {
          duplicateIds: duplicates,
          ocurrencias: duplicates.map(id => ({
            id,
            items: this.orders.filter(o => o.id === id)
          }))
        });
        console.log('Array completo de órdenes:', this.orders);
      }
    }
  }

  getCustomerName = (id: any): string =>
    this.customers.find((c: any) => c.id === id)?.name || '—';
  getMotorcyclePlate = (id: any): string =>
    this.motorcycles.find((m: any) => m.id === id)?.license_plate || '—';
  getMenuName = (menuId: any): string => {
    const menu = this.menus.find((m: any) => m.id === menuId);
    if (!menu) return '—';
    const product = this.products.find((p: any) => p.id === menu.product_id);
    return product ? product.name : '—';
  };

  handleCreate(): void {
    this.editingOrder = null;
    this.showForm = true;
  }

  handleEdit(orderId: any): void {
    const order = this.orders.find((o: any) => o.id === orderId);
    this.editingOrder = order || null;
    this.showForm = true;
  }

  async handleDelete(orderId: any): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Pedido',
      message: '¿Estás seguro de eliminar este pedido?',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await this.orderService.delete(orderId).toPromise();
        this.orders = this.orders.filter((o: any) => o.id !== orderId);
        this.notificationService.showSuccess('Pedido eliminado exitosamente');
      } catch (err) {
        console.error('Error eliminando pedido:', err);
        this.notificationService.showError('Error al eliminar el pedido');
      }
    }
  }

  async handleSubmit(formData: any): Promise<void> {
    try {
      if (this.editingOrder) {
        const updated = await this.orderService.update(this.editingOrder.id, formData).toPromise();
        this.orders = this.orders.map((o: any) =>
          o.id === this.editingOrder.id ? updated : o
        );
        this.notificationService.showSuccess('Pedido actualizado exitosamente');
      } else {
        const created = await this.orderService.create(formData).toPromise();
        this.orders = [...this.orders, created];
        this.notificationService.showSuccess('Pedido creado exitosamente');
      }
      this.showForm = false;
      this.editingOrder = null;
    } catch (err) {
      console.error('Error guardando pedido:', err);
      this.notificationService.showError('Error al guardar el pedido');
    }
  }

  handleCancel(): void {
    this.showForm = false;
    this.editingOrder = null;
  }

  // Inyección de servicios
  constructor(
    private orderService: OrderService,
    private customerService: CustomerService,
    private motorcycleService: MotorcycleService,
    private menuService: MenuService,
    private productService: ProductService,
    private notificationService: NotificationService,
    private confirmService: ConfirmationService
  ) {}
}