
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MenuService } from '../../core/services/menu.service';
import { ProductService } from '../../core/services/product.service';
import { RestaurantService } from '../../core/services/restaurant.service';
import { CartStore } from '../../core/services/cart.store';
import { Menu } from '../../core/models/menu.model';
import { Product } from '../../core/models/product.model';
import { Restaurant } from '../../core/models/restaurant.model';

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
  cartStore = inject(CartStore);

  menus: Menu[] = [];
  products: Product[] = [];
  restaurant: Restaurant | null = null;
  loading = true;
  error = '';
  restaurantId: number|null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.restaurantId = id ? +id : null;
      console.log('🏪 MenuView - Restaurant ID de la URL:', this.restaurantId);
      console.log('🏪 MenuView - Tipo:', typeof this.restaurantId);
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
        console.error('Error al cargar restaurante:', err);
      }
    });
    
    // Primero cargar todos los productos
    this.productService.getAll().subscribe({
      next: (productsData) => {
        this.products = productsData;
        
        // Luego cargar los menús de este restaurante específico
        this.menuService.getAll().subscribe({
          next: (menusData) => {
            console.log('Todos los menús del backend:', menusData);
            console.log('Buscando menús para restaurante ID:', restaurantId);
            
            // Filtrar solo los menús de este restaurante
            // Convertir ambos IDs a números para comparación correcta
            const restaurantMenus = menusData.filter(m => {
              const menuRestaurantId = typeof m.restaurant_id === 'string' 
                ? parseInt(m.restaurant_id, 10) 
                : m.restaurant_id;
              
              console.log(`Comparando: menú restaurant_id=${menuRestaurantId} con restaurantId=${restaurantId}`);
              return menuRestaurantId === restaurantId;
            });
            
            console.log('Menús filtrados para este restaurante:', restaurantMenus);
            
            // Enriquecer cada menú con los datos del producto
            this.menus = restaurantMenus.map(menu => {
              const productId = typeof menu.product_id === 'string'
                ? parseInt(menu.product_id, 10)
                : menu.product_id;
              
              const product = this.products.find(p => p.id === productId);
              
              if (!product) {
                console.warn(`Producto no encontrado para menu.product_id=${menu.product_id}`);
              }
              
              return {
                ...menu,
                product: product || null
              };
            });
            
            console.log('Menús enriquecidos con productos:', this.menus);
            this.loading = false;
          },
          error: (err) => {
            console.error('Error al cargar menús:', err);
            // Si hay error, mostrar array vacío
            this.menus = [];
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = 'Error al cargar productos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  addToCart(menu: Menu): void {
    if (!menu.product) {
      console.error('Producto no encontrado para el menú');
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
    
    // Mostrar notificación visual (opcional)
    this.showToast(`✅ ${menu.product.name} agregado al carrito`);
  }
  
  isInCart(menuId: number): boolean {
    return this.cartStore.isInCart(menuId);
  }
  
  getCartQuantity(menuId: number): number {
    return this.cartStore.getMenuQuantity(menuId);
  }
  
  private showToast(message: string): void {
    // Implementación simple de toast
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #10b981;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
}
