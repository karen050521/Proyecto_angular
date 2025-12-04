
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MenuService } from '../../core/services/menu.service';
import { ProductService } from '../../core/services/product.service';
import { RestaurantService } from '../../core/services/restaurant.service';
import { CartStore } from '../../core/services/cart.store';
import { NotificationService } from '../../core/services/notification.service';
import { Menu } from '../../core/models/menu.model';
import { Product } from '../../core/models/product.model';
import { Restaurant } from '../../core/models/restaurant.model';

/**
 * MenuView Component - Responsabilidad única: UI de visualización de menús
 * 
 * SRP: Single Responsibility Principle
 * - Solo maneja la visualización de menús de un restaurante
 * - Delega notificaciones al NotificationService
 * - Delega manejo del carrito al CartStore
 * - No maneja lógica de negocio compleja
 */
@Component({
  selector: 'app-menu-view',
  imports: [CommonModule],
  templateUrl: './menu-view.html',
  styleUrl: './menu-view.css',
})
export class MenuView implements OnInit {
  private menuService = inject(MenuService);
  private productService = inject(ProductService);
  private restaurantService = inject(RestaurantService);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  
  // Servicios públicos para el template
  cartStore = inject(CartStore);

  menus: Menu[] = [];
  products: Product[] = [];
  restaurant: Restaurant | null = null;
  loading = true;
  error = '';
  restaurantId: number | null = null;

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
    
    // Cargar información del restaurante
    this.restaurantService.getById(restaurantId).subscribe({
      next: (restaurantData) => {
        this.restaurant = restaurantData;
      },
      error: (err) => {
        console.error('❌ Error al cargar restaurante:', err);
      }
    });
    
    // Primero cargar todos los productos
    this.productService.getAll().subscribe({
      next: (productsData) => {
        this.products = productsData;
        
        // Luego cargar los menús de este restaurante específico
        this.menuService.getAll().subscribe({
          next: (menusData) => {
            // Filtrar solo los menús de este restaurante
            const restaurantMenus = menusData.filter(m => {
              const menuRestaurantId = typeof m.restaurant_id === 'string' 
                ? parseInt(m.restaurant_id, 10) 
                : m.restaurant_id;
              
              return menuRestaurantId === restaurantId;
            });
            
            // Enriquecer cada menú con los datos del producto
            this.menus = restaurantMenus.map(menu => {
              const productId = typeof menu.product_id === 'string'
                ? parseInt(menu.product_id, 10)
                : menu.product_id;
              
              const product = this.products.find(p => p.id === productId);
              
              if (!product) {
                console.warn(`⚠️ Producto no encontrado para menu.product_id=${menu.product_id}`);
              }
              
              return {
                ...menu,
                product: product || null
              };
            });
            
            this.loading = false;
          },
          error: (err) => {
            console.error('❌ Error al cargar menús:', err);
            this.menus = [];
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = 'Error al cargar productos';
        this.loading = false;
        console.error('❌ Error al cargar productos:', err);
      }
    });
  }

  addToCart(menu: Menu): void {
    if (!menu.product) {
      this.notificationService.showError('Producto no encontrado');
      return;
    }
    
    // Convertir IDs a números si son strings
    const restaurantId = typeof menu.restaurant_id === 'string' 
      ? parseInt(menu.restaurant_id, 10) 
      : menu.restaurant_id;
      
    const productId = typeof menu.product_id === 'string'
      ? parseInt(menu.product_id, 10)
      : (menu.product_id || 0);
    
    this.cartStore.addItem({
      menu_id: menu.id,
      restaurant_id: restaurantId,
      product_id: productId,
      product_name: menu.product.name,
      product_description: menu.product.description,
      product_image: menu.product.imageUrl,
      restaurant_name: this.restaurant?.name || 'Restaurante',
      price: menu.price,
      quantity: 1
    });
    
    this.notificationService.showSuccess(`✅ ${menu.product.name} agregado al carrito`);
  }
  
  increaseQuantity(menuId: number): void {
    const item = this.cartStore.items().find(item => item.menu_id === menuId);
    if (item) {
      this.cartStore.updateQuantity(item.id, item.quantity + 1);
    }
  }
  
  decreaseQuantity(menuId: number): void {
    const item = this.cartStore.items().find(item => item.menu_id === menuId);
    if (item) {
      if (item.quantity > 1) {
        this.cartStore.updateQuantity(item.id, item.quantity - 1);
      } else {
        this.cartStore.removeItem(item.id);
      }
    }
  }
  
  openCart(): void {
    this.cartStore.openSidebar();
  }
  
  isInCart(menuId: number): boolean {
    return this.cartStore.isInCart(menuId);
  }
  
  getCartQuantity(menuId: number): number {
    return this.cartStore.getMenuQuantity(menuId);
  }
}
