import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem, AddToCartPayload } from '../models/cart-item.model';

/**
 * CartStore - State management para el carrito de compras usando Signals
 * 
 * Features:
 * - Estado reactivo con Signals
 * - Persistencia automática en localStorage
 * - Selectores computados para totales y conteos
 * - UI se actualiza automáticamente
 */
@Injectable({
  providedIn: 'root'
})
export class CartStore {
  private readonly STORAGE_KEY = 'shopping_cart';
  
  // ========== ESTADO ==========
  private _items = signal<CartItem[]>(this.loadFromStorage());
  private _isSidebarOpen = signal<boolean>(false);
  
  // ========== SELECTORES (Computed) ==========
  
  // Items del carrito (readonly)
  readonly items = this._items.asReadonly();
  
  // Estado del sidebar (readonly)
  readonly isSidebarOpen = this._isSidebarOpen.asReadonly();
  
  // Cantidad total de items (suma de cantidades)
  readonly itemCount = computed(() => 
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );
  
  // Total a pagar
  readonly total = computed(() => 
    this._items().reduce((sum, item) => sum + item.subtotal, 0)
  );
  
  // Carrito vacío?
  readonly isEmpty = computed(() => this._items().length === 0);
  
  // IDs de restaurantes en el carrito
  readonly restaurantIds = computed(() => 
    [...new Set(this._items().map(item => item.restaurant_id))]
  );
  
  // ¿Hay múltiples restaurantes? (para validación)
  readonly hasMultipleRestaurants = computed(() => 
    this.restaurantIds().length > 1
  );
  
  constructor() {
    // Effect: Auto-guardar en localStorage cuando cambie el carrito
    effect(() => {
      const items = this._items();
      this.saveToStorage(items);
      console.log('🛒 Carrito actualizado:', {
        items: items.length,
        total: this.total(),
        count: this.itemCount()
      });
    });
  }
  
  // ========== ACCIONES ==========
  
  /**
   * Agregar item al carrito
   */
  addItem(payload: AddToCartPayload): void {
    const quantity = payload.quantity || 1;
    
    // Validar cantidad
    if (quantity <= 0) {
      console.warn('⚠️ Cantidad inválida:', quantity);
      return;
    }
    
    // Verificar si el producto ya existe en el carrito
    const existingItem = this._items().find(
      item => item.menu_id === payload.menu_id
    );
    
    if (existingItem) {
      // Si existe, incrementar cantidad
      this.updateQuantity(existingItem.id, existingItem.quantity + quantity);
      console.log('✅ Cantidad actualizada:', existingItem.product_name);
    } else {
      // Si no existe, crear nuevo item
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        menu_id: payload.menu_id,
        restaurant_id: payload.restaurant_id,
        product_id: payload.product_id,
        product_name: payload.product_name,
        product_description: payload.product_description,
        product_image: payload.product_image,
        restaurant_name: payload.restaurant_name,
        price: payload.price,
        quantity: quantity,
        subtotal: payload.price * quantity,
        created_at: new Date()
      };
      
      this._items.update(items => [...items, newItem]);
      console.log('✅ Item agregado:', newItem.product_name);
    }
  }
  
  /**
   * Eliminar item del carrito
   */
  removeItem(itemId: string): void {
    const item = this._items().find(i => i.id === itemId);
    this._items.update(items => items.filter(i => i.id !== itemId));
    
    if (item) {
      console.log('🗑️ Item eliminado:', item.product_name);
    }
  }
  
  /**
   * Actualizar cantidad de un item
   */
  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      console.warn('⚠️ Cantidad inválida, eliminando item');
      this.removeItem(itemId);
      return;
    }
    
    this._items.update(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, quantity, subtotal: item.price * quantity }
          : item
      )
    );
    
    const item = this._items().find(i => i.id === itemId);
    if (item) {
      console.log('📝 Cantidad actualizada:', item.product_name, '→', quantity);
    }
  }
  
  /**
   * Incrementar cantidad en 1
   */
  incrementQuantity(itemId: string): void {
    const item = this._items().find(i => i.id === itemId);
    if (item) {
      this.updateQuantity(itemId, item.quantity + 1);
    }
  }
  
  /**
   * Decrementar cantidad en 1
   */
  decrementQuantity(itemId: string): void {
    const item = this._items().find(i => i.id === itemId);
    if (item) {
      this.updateQuantity(itemId, item.quantity - 1);
    }
  }
  
  /**
   * Vaciar carrito completamente
   */
  clearCart(): void {
    this._items.set([]);
    console.log('🗑️ Carrito vaciado');
  }
  
  /**
   * Eliminar items de un restaurante específico
   */
  clearRestaurantItems(restaurantId: number): void {
    this._items.update(items => 
      items.filter(item => item.restaurant_id !== restaurantId)
    );
    console.log('🗑️ Items del restaurante eliminados:', restaurantId);
  }
  
  /**
   * Verificar si un menú está en el carrito
   */
  isInCart(menuId: number): boolean {
    return this._items().some(item => item.menu_id === menuId);
  }
  
  /**
   * Obtener cantidad de un menú específico en el carrito
   */
  getMenuQuantity(menuId: number): number {
    const item = this._items().find(item => item.menu_id === menuId);
    return item ? item.quantity : 0;
  }
  
  // ========== CONTROL DEL SIDEBAR ==========
  
  /**
   * Abrir sidebar del carrito
   */
  openSidebar(): void {
    this._isSidebarOpen.set(true);
    console.log('🛒 Sidebar abierto');
  }
  
  /**
   * Cerrar sidebar del carrito
   */
  closeSidebar(): void {
    this._isSidebarOpen.set(false);
    console.log('🛒 Sidebar cerrado');
  }
  
  /**
   * Toggle sidebar (abrir/cerrar)
   */
  toggleSidebar(): void {
    this._isSidebarOpen.update(isOpen => !isOpen);
    console.log('🛒 Sidebar toggle:', this._isSidebarOpen());
  }
  
  // ========== PERSISTENCIA ==========
  
  /**
   * Cargar carrito desde localStorage
   */
  private loadFromStorage(): CartItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const items = JSON.parse(data);
      console.log('📦 Carrito cargado desde localStorage:', items.length, 'items');
      return items;
    } catch (error) {
      console.error('❌ Error al cargar carrito:', error);
      return [];
    }
  }
  
  /**
   * Guardar carrito en localStorage
   */
  private saveToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('❌ Error al guardar carrito:', error);
    }
  }
}
