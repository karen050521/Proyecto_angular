import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../core/services/restaurant.service';
import { ProductService } from '../../core/services/product.service';
import { MenuService } from '../../core/services/menu.service';
import { Restaurant } from '../../core/models/restaurant.model';
import { Product } from '../../core/models/product.model';
import { Menu } from '../../core/models/menu.model';

@Component({
  selector: 'app-restaurant-managente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-managente.html',
  styleUrl: './restaurant-managente.css',
})
export class RestaurantManagente implements OnInit {
  activeTab: 'restaurants' | 'products' | 'list-restaurants' | 'list-products' | 'menus' = 'restaurants';
  
  // Restaurant form
  restaurantName = '';
  restaurantAddress = '';
  restaurantPhone = '';
  restaurantEmail = '';
  
  // Product form
  productName = '';
  productDescription = '';
  productPrice: number | null = null;
  productCategory = '';
  productImageUrl = '';
  
  // Lists
  restaurants: Restaurant[] = [];
  products: Product[] = [];
  menus: Menu[] = [];
  
  // Menu form
  selectedRestaurantId: number | null = null;
  selectedProductId: number | null = null;
  menuPrice: number | null = null;
  menuAvailability = true;
  
  // Menu editing
  editingMenuId: number | null = null;
  managingRestaurantId: number | null = null;
  restaurantMenus: Menu[] = [];
  
  // UI state
  loading = false;
  error = '';
  success = '';

  constructor(
    private restaurantService: RestaurantService,
    private productService: ProductService,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    this.loadRestaurants();
    this.loadProducts();
    this.loadMenus();
  }

  // Tab management
  setActiveTab(tab: 'restaurants' | 'products' | 'list-restaurants' | 'list-products' | 'menus'): void {
    this.activeTab = tab;
    this.clearMessages();
    this.editingMenuId = null;
    this.managingRestaurantId = null;
  }

  // Restaurant methods
  createRestaurant(): void {
    this.loading = true;
    this.clearMessages();
    
    // Validaciones
    if (!this.restaurantName || !this.restaurantAddress || !this.restaurantPhone) {
      this.error = 'Nombre, dirección y teléfono son obligatorios';
      this.loading = false;
      return;
    }

    // Validar que el nombre solo contenga letras y espacios
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(this.restaurantName)) {
      this.error = 'El nombre del restaurante solo puede contener letras';
      this.loading = false;
      return;
    }

    // Validar que el teléfono solo contenga números (y opcionalmente espacios, guiones o paréntesis)
    const phoneRegex = /^[\d\s\-()]+$/;
    if (!phoneRegex.test(this.restaurantPhone)) {
      this.error = 'El teléfono solo puede contener números';
      this.loading = false;
      return;
    }

    // Validar email si se proporciona
    if (this.restaurantEmail) {
      const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(this.restaurantEmail)) {
        this.error = 'El email no es válido (ej: nombre@gmail.com)';
        this.loading = false;
        return;
      }
    }
    
    const restaurant = {
      name: this.restaurantName,
      address: this.restaurantAddress,
      phone: this.restaurantPhone,
      email: this.restaurantEmail
    };
    
    this.restaurantService.create(restaurant).subscribe({
      next: () => {
        this.success = 'Restaurante creado correctamente';
        this.restaurantName = '';
        this.restaurantAddress = '';
        this.restaurantPhone = '';
        this.restaurantEmail = '';
        this.loading = false;
        this.loadRestaurants();
      },
      error: (err) => {
        this.error = 'Error al crear restaurante';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadRestaurants(): void {
    this.restaurantService.getAll().subscribe({
      next: (data) => {
        this.restaurants = data;
      },
      error: (err) => {
        console.error('Error al cargar restaurantes:', err);
      }
    });
  }

  // Product methods
  createProduct(): void {
    this.loading = true;
    this.clearMessages();
    
    // Validaciones
    if (!this.productName || this.productPrice === null) {
      this.error = 'Nombre y precio son obligatorios';
      this.loading = false;
      return;
    }

    // Validar que el nombre del producto no esté vacío y tenga al menos 2 caracteres
    if (this.productName.trim().length < 2) {
      this.error = 'El nombre del producto debe tener al menos 2 caracteres';
      this.loading = false;
      return;
    }

    // Validar que el precio sea un número positivo
    if (this.productPrice <= 0) {
      this.error = 'El precio debe ser mayor a 0';
      this.loading = false;
      return;
    }

    // Validar que el precio tenga máximo 2 decimales
    const priceStr = this.productPrice.toString();
    if (priceStr.includes('.') && priceStr.split('.')[1].length > 2) {
      this.error = 'El precio puede tener máximo 2 decimales';
      this.loading = false;
      return;
    }

    // Validar categoría si se proporciona (solo letras y espacios)
    if (this.productCategory) {
      const categoryRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (!categoryRegex.test(this.productCategory)) {
        this.error = 'La categoría solo puede contener letras';
        this.loading = false;
        return;
      }
    }
    
    const product = {
      name: this.productName,
      description: this.productDescription,
      price: this.productPrice,
      category: this.productCategory,
      imageUrl: this.productImageUrl
    };
    
    this.productService.create(product).subscribe({
      next: () => {
        this.success = 'Producto creado correctamente';
        this.productName = '';
        this.productDescription = '';
        this.productPrice = null;
        this.productCategory = '';
        this.productImageUrl = '';
        this.loading = false;
        this.loadProducts();
      },
      error: (err) => {
        this.error = 'Error al crear producto';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
      }
    });
  }

  // Menu methods
  loadMenus(): void {
    this.menuService.getAll().subscribe({
      next: (data) => {
        this.menus = data;
      },
      error: (err) => {
        console.error('Error al cargar menús:', err);
      }
    });
  }

  createMenu(): void {
    this.loading = true;
    this.clearMessages();
    
    if (!this.selectedRestaurantId || !this.selectedProductId || this.menuPrice === null) {
      this.error = 'Restaurante, producto y precio son obligatorios';
      this.loading = false;
      return;
    }

    if (this.menuPrice <= 0) {
      this.error = 'El precio debe ser mayor a 0';
      this.loading = false;
      return;
    }
    
    const menu = {
      restaurant_id: this.selectedRestaurantId,
      product_id: this.selectedProductId,
      price: this.menuPrice,
      availability: this.menuAvailability
    };
    
    this.menuService.create(menu).subscribe({
      next: () => {
        this.success = 'Menú creado correctamente';
        this.selectedRestaurantId = null;
        this.selectedProductId = null;
        this.menuPrice = null;
        this.menuAvailability = true;
        this.loading = false;
        this.loadMenus();
      },
      error: (err) => {
        console.error('Error al crear menú:', err);
        this.error = 'Error al crear menú. Verifica que el backend esté corriendo.';
        this.loading = false;
      }
    });
  }

  manageRestaurantMenu(restaurantId: number): void {
    this.managingRestaurantId = restaurantId;
    this.activeTab = 'menus';
    this.loadRestaurantMenus(restaurantId);
  }

  loadRestaurantMenus(restaurantId: number): void {
    this.restaurantMenus = this.menus.filter(m => m.restaurant_id === restaurantId);
  }

  editMenu(menu: Menu): void {
    this.editingMenuId = menu.id;
    this.selectedProductId = menu.product_id ?? null;
    this.menuPrice = menu.price;
    this.menuAvailability = menu.availability;
  }

  updateMenu(menuId: number): void {
    this.loading = true;
    this.clearMessages();
    
    if (this.menuPrice === null || this.menuPrice <= 0) {
      this.error = 'El precio debe ser mayor a 0';
      this.loading = false;
      return;
    }
    
    const updates = {
      price: this.menuPrice,
      availability: this.menuAvailability
    };
    
    this.menuService.update(menuId, updates).subscribe({
      next: () => {
        this.success = 'Menú actualizado correctamente';
        this.editingMenuId = null;
        this.loading = false;
        this.loadMenus();
        if (this.managingRestaurantId) {
          this.loadRestaurantMenus(this.managingRestaurantId);
        }
      },
      error: (err) => {
        this.error = 'Error al actualizar menú';
        this.loading = false;
        console.error(err);
      }
    });
  }

  cancelEdit(): void {
    this.editingMenuId = null;
    this.selectedProductId = null;
    this.menuPrice = null;
    this.menuAvailability = true;
  }

  deleteMenu(menuId: number): void {
    if (!confirm('¿Estás seguro de eliminar este menú?')) {
      return;
    }
    
    this.menuService.delete(menuId).subscribe({
      next: () => {
        this.success = 'Menú eliminado correctamente';
        this.loadMenus();
        if (this.managingRestaurantId) {
          this.loadRestaurantMenus(this.managingRestaurantId);
        }
      },
      error: (err) => {
        this.error = 'Error al eliminar menú';
        console.error(err);
      }
    });
  }

  getProductById(id: number | null | undefined): Product | undefined {
    if (!id) return undefined;
    return this.products.find(p => p.id === id);
  }

  getRestaurantById(id: number | undefined): Restaurant | undefined {
    return this.restaurants.find(r => r.id === id);
  }

  // Utility
  clearMessages(): void {
    this.error = '';
    this.success = '';
  }
}
