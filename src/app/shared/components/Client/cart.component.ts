import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AddressService } from '../../../core/services/address.service';
import { MenuService } from '../../../core/services/menu.service';
import { MotorcycleService } from '../../../core/services/motorcycle.service';
import { OrderService } from '../../../core/services/order.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  imports: [CommonModule, FormsModule]
})
export class CartComponent implements OnInit {
  customerId: string|null = localStorage.getItem('customerId');
  cartItems: any[] = [];
  addresses: any[] = [];
  menus: any[] = [];
  motorcycles: any[] = [];
  maxItems = 1;
  form: any = {
    customer_id: this.customerId,
    address: '',
    menu_id: '',
    motorcycle_id: '',
    quantity: 1,
    total_price: '',
    status: 'pending',
    created_at: new Date().toISOString().replace('T', ' ').slice(0, 26)
  };

  constructor(
    private addressService: AddressService,
    private menuService: MenuService,
    private motorcycleService: MotorcycleService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.customerId) {
      alert('Por favor inicia sesión para acceder al carrito');
      this.router.navigate(['/login']);
      return;
    }

    const stored = localStorage.getItem('cart');
    if (stored) {
      this.cartItems = JSON.parse(stored);
      this.form.menu_id = this.cartItems[0]?.menu_id || '';
      this.form.quantity = this.cartItems[0]?.quantity || 1;
      this.form.total_price = this.cartItems[0] ? this.cartItems[0].price * this.cartItems[0].quantity : '';
    }

    this.fetchData();
  }

  fetchData(): void {
    Promise.all([
      this.addressService.getAll().toPromise(),
      this.menuService.getAll().toPromise(),
      this.motorcycleService.getAll().toPromise()
    ]).then(([addressesData, menusData, motorcyclesData]) => {
      this.addresses = addressesData ?? [];
      this.menus = menusData ?? [];
      this.motorcycles = (motorcyclesData ?? []).filter((m: any) => m.status === 'available');
    }).catch(err => {
      console.error('Error fetching data:', err);
    });
  }

  handleRemove(id: string): void {
    this.cartItems = [];
    localStorage.removeItem('cart');
  }

  handleQuantityChange(id: string, value: string): void {
    const qty = Math.max(1, parseInt(value) || 1);
    const updated = this.cartItems.map(item =>
      item.id === id ? { ...item, quantity: qty } : item
    );
    this.cartItems = updated;
    localStorage.setItem('cart', JSON.stringify(updated));
    this.form.quantity = qty;
  }

  get total(): number {
    return this.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  handleFormChange(event: any): void {
    this.form = { ...this.form, [event.target.name]: event.target.value };
  }

  handleApartmentSelect(event: any): void {
    this.form.address = event.target.value;
  }

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const requiredFields = [
      { key: 'customer_id', label: 'Cliente' },
      { key: 'address', label: 'Dirección' },
      { key: 'quantity', label: 'Cantidad' }
    ];
    const missing = requiredFields.filter(f => !this.form[f.key]);
    if (!this.cartItems[0]?.menu_id) {
      missing.push({ key: 'menu_id', label: 'Menú' });
    }
    if (missing.length > 0 || this.total <= 0) {
      const missingLabels = missing.map(f => f.label);
      if (this.total <= 0) missingLabels.push('Precio Total');
      console.log('Faltan los siguientes datos para enviar el pedido:', missingLabels);
      return;
    }
    try {
      let addressObj = this.form.address;
      if (typeof addressObj === 'string') {
        try {
          addressObj = JSON.parse(addressObj);
        } catch (e) {
          // Si no es JSON, dejar como está
        }
      }
      const orderData = {
        customer_id: this.form.customer_id,
        menu_id: this.cartItems[0]?.menu_id,
        motorcycle_id: this.form.motorcycle_id || null,
        quantity: this.cartItems[0]?.quantity || this.form.quantity,
        total_price: this.total,
        status: 'pending' as 'pending',
        created_at: this.form.created_at,
        address_id: addressObj.id || addressObj.address_id || undefined
      };
      await this.orderService.create(orderData).toPromise();
      alert('¡Pedido realizado con éxito!');
      this.cartItems = [];
      localStorage.removeItem('cart');
    } catch (error) {
      alert('Error al realizar el pedido. Intenta de nuevo.');
    }
  }
}