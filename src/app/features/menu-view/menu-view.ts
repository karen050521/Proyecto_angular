
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MenuService } from '../../core/services/menu.service';
import { ProductService } from '../../core/services/product.service';
import { Menu } from '../../core/models/menu.model';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-menu-view',
  imports: [CommonModule],
  templateUrl: './menu-view.html',
  styleUrl: './menu-view.css',
})
export class MenuView implements OnInit {
  private menuService = inject(MenuService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);

  menus: Menu[] = [];
  products: Product[] = [];
  loading = true;
  error = '';
  restaurantId: number|null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.restaurantId = id ? +id : null;
      if (this.restaurantId) {
        this.loadMenusAndProducts(this.restaurantId);
      } else {
        this.error = 'Restaurante no encontrado';
        this.loading = false;
      }
    });
  }

  loadMenusAndProducts(restaurantId: number): void {
    this.loading = true;
    // Cargar todos los productos directamente
    this.productService.getAll().subscribe({
      next: (productsData) => {
        console.log('PRODUCTS DATA:', productsData);
        this.products = productsData;
        // Convertir todos los productos a formato de menú para mostrarlos
        this.menus = this.products.map(product => ({
          id: product.id || 0,
          restaurant_id: restaurantId,
          product_id: product.id,
          price: product.price,
          availability: true,
          product: product
        }));
        console.log('MENUS (todos los productos):', this.menus);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar productos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  addToCart(menu: Menu): void {
    // Por ahora solo mostramos un mensaje
    console.log('Agregando al carrito:', menu.product?.name);
    alert(`${menu.product?.name} agregado al carrito! 🛒`);
    // TODO: Implementar lógica real del carrito
  }
}
