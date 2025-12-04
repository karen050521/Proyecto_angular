import { Injectable, signal, computed } from '@angular/core';
import { CartItem, AddToCartPayload } from '../models/cart-item.model';

/**
 * CartStore - State management SOLO FRONTEND para el carrito de compras
 * 
 * IMPORTANTE: El carrito NO existe en el backend
 * - Usa localStorage para persistencia
 * - Al hacer checkout, se crea UNA orden en /orders con todos los items
 * 
 * Responsabilidades:
 * ✅ Mantener estado del carrito en memoria (Signals)
 * ✅ Persistir en localStorage
 * ✅ Proveer selectores computados (total, count, isEmpty)
 * ✅ Gestionar estado del sidebar
 * 
 * NO responsabilidades:
 * ❌ Crear órdenes (eso es responsabilidad de OrderService)
 * ❌ Validaciones complejas de negocio
 */
@Injectable({
  providedIn: 'root'
})
export class CartStore {
  private readonly STORAGE_KEY = 'quickdeliver_cart';
  
  // ========== ESTADO PRIVADO ==========
  private _items = signal<CartItem[]>([]);
  private _isSidebarOpen = signal<boolean>(false);
  
  // ========== ESTADO PÚBLICO (readonly) ==========
  readonly items = this._items.asReadonly();
  readonly isSidebarOpen = this._isSidebarOpen.asReadonly();
  
  // ========== SELECTORES COMPUTADOS ==========
  readonly itemCount = computed(() => 
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );
  
  readonly total = computed(() => 
    this._items().reduce((sum, item) => sum + item.subtotal, 0)
  );
  
  readonly isEmpty = computed(() => this._items().length === 0);
  
  readonly restaurantIds = computed(() => 
    [...new Set(this._items().map(item => item.restaurant_id))]
  );
  
  readonly hasMultipleRestaurants = computed(() => 
    this.restaurantIds().length > 1
  );
  
  // ========== CONSTRUCTOR ==========
  constructor() {
    this.loadFromLocalStorage();
  }
  
  // ========== MÉTODOS PRIVADOS ==========
  
  /**
   * Cargar carrito desde localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as CartItem[];
        this._items.set(items);
        console.log('✅ Carrito cargado desde localStorage:', items.length, 'items');
      } else {
        console.log('📦 Carrito vacío (primera vez)');
      }
    } catch (error) {
      console.error('❌ Error al cargar carrito desde localStorage:', error);
      this._items.set([]);
    }
  }
  
  /**
   * Guardar carrito en localStorage
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._items()));
      console.log('💾 Carrito guardado en localStorage');
    } catch (error) {
      console.error('❌ Error al guardar carrito en localStorage:', error);
    }
  }
  
  /**
   * Generar ID único para items del carrito
   */
  private generateId(): string {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // ========== MÉTODOS PÚBLICOS ==========
  
  /**
   * Agregar item al carrito
   */
  addItem(payload: AddToCartPayload): void {
    const quantity = payload.quantity || 1;
    
    if (quantity <= 0) {
      console.warn('⚠️ Cantidad inválida:', quantity);
      return;
    }
    
    // Verificar si el item ya existe
    const existingItem = this._items().find(
      item => item.menu_id === payload.menu_id
    );
    
    if (existingItem) {
      // Actualizar cantidad del item existente
      this.updateQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      // Crear nuevo item
      const newItem: CartItem = {
        id: this.generateId(),
        menu_id: payload.menu_id,
        restaurant_id: payload.restaurant_id,
        product_id: payload.product_id,
        product_name: payload.product_name,
        product_description: payload.product_description || '',
        product_image: payload.product_image || '',
        restaurant_name: payload.restaurant_name,
        price: payload.price,
        quantity: quantity,
        subtotal: payload.price * quantity,
        created_at: new Date()
      };
      
      this._items.update(items => [...items, newItem]);
      this.saveToLocalStorage();
      console.log('✅ Item agregado:', newItem.product_name);
    }
  }
  
  /**
   * Actualizar cantidad de un item
   */
  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }
    
    this._items.update(items =>
      items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity,
            subtotal: item.price * quantity
          };
        }
        return item;
      })
    );
    
    this.saveToLocalStorage();
    console.log('✅ Cantidad actualizada:', quantity);
  }
  
  /**
   * Eliminar item del carrito
   */
  removeItem(itemId: string): void {
    this._items.update(items => items.filter(i => i.id !== itemId));
    this.saveToLocalStorage();
    console.log('✅ Item eliminado');
  }
  
  /**
   * Vaciar carrito completamente
   */
  clearCart(): void {
    this._items.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('✅ Carrito vaciado');
  }
  
  /**
   * Eliminar items de un restaurante específico
   */
  clearRestaurantItems(restaurantId: number): void {
    this._items.update(items => 
      items.filter(item => item.restaurant_id !== restaurantId)
    );
    this.saveToLocalStorage();
    console.log('✅ Items del restaurante eliminados');
  }
  
  /**
   * Verificar si un menú está en el carrito
   */
  isInCart(menuId: number): boolean {
    return this._items().some(item => item.menu_id === menuId);
  }
  
  /**
   * Obtener cantidad de un menú específico
   */
  getMenuQuantity(menuId: number): number {
    const item = this._items().find(item => item.menu_id === menuId);
    return item ? item.quantity : 0;
  }
  
  /**
   * Obtener item por menu_id
   */
  getItemByMenuId(menuId: number): CartItem | undefined {
    return this._items().find(item => item.menu_id === menuId);
  }
  
  // ========== CONTROL DEL SIDEBAR ==========
  
  openSidebar(): void {
    this._isSidebarOpen.set(true);
  }
  
  closeSidebar(): void {
    this._isSidebarOpen.set(false);
  }
  
  toggleSidebar(): void {
    this._isSidebarOpen.update(isOpen => !isOpen);
  }
  
  /**
   * Recargar carrito desde localStorage
   */
  reloadCart(): void {
    this.loadFromLocalStorage();
  }
}
