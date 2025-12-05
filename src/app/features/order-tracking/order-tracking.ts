import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AddressService } from '../../core/services/address.service';
import { MotorcycleService } from '../../core/services/motorcycle.service';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { Order } from '../../core/models/order.model';
import { Address } from '../../core/models/address.model';
import { Motorcycle } from '../../core/models/motorcycle.model';
import { RestaurantMapComponent } from '../../shared/restaurant-map/restaurant-map';

@Component({
  selector: 'app-order-tracking',
  imports: [CommonModule, FormsModule, RestaurantMapComponent],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.css',
})
export class OrderTrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private addressService = inject(AddressService);
  private motorcycleService = inject(MotorcycleService);
  private confirmService = inject(ConfirmationService);

  @ViewChild(RestaurantMapComponent) mapComponent?: RestaurantMapComponent;

  orderId!: number;
  order: Order | null = null;
  address: Address | null = null;
  motorcycle: Motorcycle | null = null;
  loading = true;
  error = '';
  isEditingAddress = false;

  addressForm: Omit<Address, 'id' | 'created_at'> = {
    order_id: 0,
    street: '',
    city: '',
    state: '',
    postal_code: '',
    additional_info: ''
  };

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      this.loadOrderData();
    });
  }

  loadOrderData(): void {
    this.loading = true;
    this.orderService.getById(this.orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.addressForm.order_id = order.id!;
        
        // Cargar dirección si existe
        if (order.address) {
          this.address = order.address;
        }

        // Cargar información del repartidor si está asignado
        if (order.motorcycle_id) {
          this.motorcycleService.getById(order.motorcycle_id).subscribe({
            next: (motorcycle) => {
              this.motorcycle = motorcycle;
            },
            error: () => {
              // No hacer nada si no se puede cargar el repartidor
            }
          });
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la orden';
        this.loading = false;
      }
    });
  }

  saveAddress(event: Event): void {
    event.preventDefault();
    
    if (this.address && this.address.id) {
      // Actualizar dirección existente
      this.addressService.update(this.address.id, this.addressForm).subscribe({
        next: () => {
          this.loadOrderData();
          this.isEditingAddress = false;
        },
        error: () => {
          this.error = 'Error al actualizar la dirección';
        }
      });
    } else {
      // Crear nueva dirección
      this.addressService.create(this.addressForm).subscribe({
        next: () => {
          this.loadOrderData();
        },
        error: () => {
          this.error = 'Error al guardar la dirección';
        }
      });
    }
  }

  editAddress(): void {
    if (this.address) {
      this.addressForm = { ...this.address };
    }
    this.isEditingAddress = true;
  }

  cancelEditAddress(): void {
    this.isEditingAddress = false;
    if (this.address) {
      this.addressForm = { ...this.address };
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
      available: 'Disponible',
      in_use: 'En uso',
      maintenance: 'Mantenimiento'
    };
    return labels[status] || status;
  }

  goBack(): void {
    this.router.navigate(['/restaurantes']);
  }

  async completeOrder(): Promise<void> {
    if (!this.order) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Completar Orden',
      message: '¿Marcar esta orden como completada?',
      confirmText: 'Completar',
      cancelText: 'Cancelar',
      type: 'info'
    });

    if (!confirmed) {
      return;
    }

    this.loading = true;

    // Actualizar el estado de la orden a "delivered"
    this.orderService.update(this.order.id!, { status: 'delivered' }).subscribe({
      next: () => {
        // Detener el tracking del WebSocket
        if (this.mapComponent && this.motorcycle) {
          console.log('🛑 Deteniendo tracking por orden completada');
          this.mapComponent.stopTracking();
        }

        // Si hay un repartidor asignado, detener tracking y marcarlo como disponible
        if (this.order!.motorcycle_id && this.motorcycle) {
          // Detener tracking en el backend
          this.motorcycleService.stopTracking(this.motorcycle.license_plate).subscribe({
            next: () => {
              console.log('✅ Tracking detenido en backend');
            },
            error: (err) => {
              console.error('❌ Error al detener tracking:', err);
            }
          });

          // Marcar repartidor como disponible
          this.motorcycleService.update(this.order!.motorcycle_id, { status: 'available' }).subscribe({
            next: () => {
              this.loadOrderData();
              // Información - no se muestra nada, solo se recarga
            },
            error: () => {
              this.loadOrderData();
              // Información - no se muestra nada, solo se recarga
            }
          });
        } else {
          this.loadOrderData();
          // Información - no se muestra nada, solo se recarga
        }
      },
      error: () => {
        this.error = 'Error al completar la orden';
        this.loading = false;
      }
    });
  }
}