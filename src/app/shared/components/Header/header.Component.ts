  import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserAvatarComponent } from './user.Avatar.Component';
import { CartIconComponent } from '../cart-icon/cart-icon';
import { NotificationIconComponent } from '../../notification-icon/notification-icon';
import { SearchService, SearchResult } from '../../../core/services/search.service';
import { MenuService } from '../../../core/services/menu.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.Component.html',
  styleUrls: ['./header.Component.css'],
  imports: [
    CommonModule,
    FormsModule,
    UserAvatarComponent,
    RouterModule,
    CartIconComponent,
    NotificationIconComponent
  ]
})

export class HeaderComponent implements OnInit {
  @Input() isMobile: boolean = false;
  @Input() sidebarOpen: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() goToHome = new EventEmitter<void>();

  private router = inject(Router);
  searchService = inject(SearchService);
  private menuService = inject(MenuService);
  private restaurantService = inject(RestaurantService);
  private orderService = inject(OrderService);

  photoURL = localStorage.getItem('photoURL') || '';
  showProfileMenu = false;
  
  // Búsqueda
  searchQuery = '';
  showSearchResults = false;
  
  ngOnInit(): void {
    this.loadSearchData();
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  goHome() {
    // Emit event to parent to activate "inicio" section
    this.goToHome.emit();
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  logout() {
    // Implement logout logic here
    console.log('Logout clicked');
    this.showProfileMenu = false;
    // TODO: Add actual logout logic (clear tokens, redirect, etc.)
  }
  
  /**
   * Cargar datos para búsqueda
   */
  private loadSearchData(): void {
    const searchData: SearchResult[] = [];
    
    // Cargar menús
    this.menuService.getAll().subscribe({
      next: (menus) => {
        menus.forEach(menu => {
          searchData.push({
            id: menu.id!,
            type: 'menu',
            title: menu.product?.name || 'Producto sin nombre',
            subtitle: `$${menu.price} - ${menu.restaurant?.name || 'Restaurante'}`,
            image: menu.product?.imageUrl || undefined,
            relevance: 0,
            matchedTerms: []
          });
        });
        this.searchService.updateSearchData(searchData);
      }
    });
    
    // Cargar restaurantes
    this.restaurantService.getAll().subscribe({
      next: (restaurants) => {
        restaurants.forEach(restaurant => {
          searchData.push({
            id: restaurant.id!,
            type: 'restaurant',
            title: restaurant.name,
            subtitle: restaurant.address || 'Sin dirección',
            image: restaurant.imageUrl || undefined,
            relevance: 0,
            matchedTerms: []
          });
        });
        this.searchService.updateSearchData(searchData);
      }
    });
  }
  
  /**
   * Realizar búsqueda
   */
  onSearch(query: string): void {
    this.searchQuery = query;
    this.showSearchResults = query.length >= 2;
    this.searchService.search(query);
  }
  
  /**
   * Seleccionar resultado
   */
  selectResult(result: SearchResult): void {
    this.showSearchResults = false;
    this.searchQuery = '';
    
    // Navegar según el tipo
    switch (result.type) {
      case 'menu':
        // Encontrar el restaurante del menú y navegar
        this.menuService.getById(result.id).subscribe({
          next: (menu) => {
            if (menu.restaurant_id) {
              this.router.navigate(['/restaurantes', menu.restaurant_id, 'menu']);
            }
          }
        });
        break;
      case 'restaurant':
        this.router.navigate(['/restaurantes', result.id, 'menu']);
        break;
      case 'order':
        this.router.navigate(['/pedidos']);
        break;
    }
  }
  
  /**
   * Limpiar búsqueda
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.showSearchResults = false;
    this.searchService.clear();
  }
}