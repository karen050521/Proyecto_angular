import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { MenuService } from '../../../core/services/menu.service';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  imports: [CommonModule, FormsModule]
})
export class OrdersComponent implements OnInit {
  restaurants: any[] = [];
  selectedMenu: number|null = null;
  menuItems: any[] = [];
  products: any[] = [];
  loading = false;
  error: string|null = null;
  cartItems: any[] = [];
  maxItems = 1;

  constructor(
    private restaurantService: RestaurantService,
    private productService: ProductService,
    private menuService: MenuService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchData();
  }

  async fetchData() {
    try {
      this.loading = true;
      const [restData, prodData] = await Promise.all([
        this.restaurantService.getAll().toPromise(),
        this.productService.getAll().toPromise()
      ]);
      this.restaurants = restData ?? [];
      this.products = prodData ?? [];
    } catch (err) {
      this.error = 'Error cargando restaurantes o productos';
    } finally {
      this.loading = false;
    }
  }

  async handleShowMenu(restaurantId: number) {
    this.selectedMenu = restaurantId;
    this.loading = true;
    this.error = null;
    try {
      // MenuService.getAll() should not receive an argument if it expects none
      const menu = await this.menuService.getAll().toPromise();
      const filteredMenu = (menu ?? []).filter((item: any) => item.restaurant_id == restaurantId);
      const menuWithProduct = filteredMenu.map((item: any) => {
        const prod = this.products.find((p: any) => p.id === item.product_id);
        return {...item, name: prod?.name || '', category: prod?.category || '', description: prod?.description || ''};
      });
      this.menuItems = menuWithProduct;
    } catch (err) {
      this.menuItems = [];
      this.error = 'Error cargando menú';
    } finally {
      this.loading = false;
    }
  }

  handleAddToCart(product: any) {
    if (this.cartItems.length < this.maxItems) {
      const item = {
        id: product.product_id,
        name: product.name,
        price: product.price,
        menu_id: product.id,
        restaurant_id: this.selectedMenu,
        quantity: 1,
      };
      this.cartItems = [item];
      localStorage.setItem('cart', JSON.stringify([item]));
      this.router.navigate(['/dashboard/client/cart']);
    }
  }
}