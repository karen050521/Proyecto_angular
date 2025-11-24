import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { RestaurantService } from '../services/restaurant.service';
import { CustomerService } from '../services/customer.service';
import { AddressService } from '../services/address.service';
import { MenuService } from '../services/menu.service';
import { ProductService } from '../services/product.service';
import { MotorcycleService } from '../services/motorcycle.service';
import { OrderService } from '../services/order.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-client-layout',
  templateUrl: './client-layout.component.html',
  imports: [CommonModule, RouterOutlet, RouterModule, HttpClientModule],
  providers: [
    RestaurantService,
    CustomerService,
    AddressService,
    MenuService,
    ProductService,
    MotorcycleService,
    OrderService
  ]
})
export class ClientLayoutComponent {
  links = [
    { to: '/dashboard/client/orders', label: 'Pedidos' },
    { to: '/dashboard/client/cart', label: 'Carrito' },
    { to: '/dashboard/client/profile', label: 'Perfil' },
  ];
}