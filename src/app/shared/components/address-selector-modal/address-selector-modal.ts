import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddressSelectorService } from '../../../core/services/address-selector.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Address } from '../../../core/models/address.model';

@Component({
  selector: 'app-address-selector-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address-selector-modal.html',
  styleUrl: './address-selector-modal.css'
})
export class AddressSelectorModal {
  private addressSelectorService: AddressSelectorService = inject(AddressSelectorService);
  private notificationService: NotificationService = inject(NotificationService);
  
  isOpen = this.addressSelectorService.getIsOpen();
  showForm = signal(true);
  loading = signal(false);
  
  // Formulario para dirección (como propiedades normales, no signal)
  addressForm = {
    street: '',
    city: '',
    state: '',
    postal_code: '',
    additional_info: ''
  };

  constructor() {
    // Resetear formulario cuando se abre el modal
    effect(() => {
      if (this.isOpen()) {
        this.resetForm();
      }
    });
  }

  private resetForm(): void {
    this.addressForm = {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      additional_info: ''
    };
  }

  confirmAddress(): void {
    const form = this.addressForm;
    
    // Validaciones básicas
    if (!form.street.trim() || !form.city.trim() || !form.state.trim() || !form.postal_code.trim()) {
      this.notificationService.showWarning('Por favor completa todos los campos obligatorios');
      return;
    }

    // Crear objeto de dirección (sin id, sin user_id, sin order_id)
    const addressData: Omit<Address, 'id' | 'created_at' | 'order_id' | 'user_id'> = {
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postal_code: form.postal_code.trim(),
      additional_info: form.additional_info?.trim() || ''
    };
    
    // Enviar la dirección al servicio para que sea usada en la creación de la orden
    this.addressSelectorService.selectAddress(addressData as Address);
    this.notificationService.showSuccess('Dirección confirmada');
  }

  cancel(): void {
    this.addressSelectorService.close();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }
}
