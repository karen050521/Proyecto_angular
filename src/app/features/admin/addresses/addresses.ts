import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../../core/services/address.service';
import { Address } from '../../../core/models/address.model';

@Component({
  selector: 'app-addresses',
  imports: [CommonModule, FormsModule],
  templateUrl: './addresses.html',
  styleUrl: './addresses.css',
})
export class AddressesListComponent implements OnInit {
  private addressService = inject(AddressService);

  addresses: Address[] = [];
  loading = true;
  error = '';
  showCreateForm = false;
  editingAddress: Address | null = null;

  formData: Address = {
    order_id: 0,
    street: '',
    city: '',
    state: '',
    postal_code: '',
    additional_info: ''
  };

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.loading = true;
    this.addressService.getAll().subscribe({
      next: (data) => {
        this.addresses = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar direcciones';
        this.loading = false;
        console.error(err);
      }
    });
  }

  saveAddress(event: Event): void {
    event.preventDefault();
    
    if (this.editingAddress && this.editingAddress.id) {
      // Actualizar
      this.addressService.update(this.editingAddress.id, this.formData).subscribe({
        next: () => {
          this.loadAddresses();
          this.cancelEdit();
        },
        error: (err) => {
          this.error = 'Error al actualizar dirección';
          console.error(err);
        }
      });
    } else {
      // Crear
      this.addressService.create(this.formData).subscribe({
        next: () => {
          this.loadAddresses();
          this.cancelEdit();
        },
        error: (err) => {
          this.error = 'Error al crear dirección';
          console.error(err);
        }
      });
    }
  }

  editAddress(address: Address): void {
    this.editingAddress = address;
    this.formData = { ...address };
    this.showCreateForm = false;
  }

  deleteAddress(id: number): void {
    if (!confirm('¿Estás seguro de eliminar esta dirección?')) {
      return;
    }

    this.addressService.delete(id).subscribe({
      next: () => {
        this.loadAddresses();
      },
      error: (err) => {
        this.error = 'Error al eliminar dirección';
        console.error(err);
      }
    });
  }

  cancelEdit(): void {
    this.showCreateForm = false;
    this.editingAddress = null;
    this.formData = {
      order_id: 0,
      street: '',
      city: '',
      state: '',
      postal_code: '',
      additional_info: ''
    };
  }
}
