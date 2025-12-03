import { Product } from './product.model';
import { Restaurant } from './restaurant.model';

/**
 * CartItem model - Representa un item en el carrito de compras
 */
export interface CartItem {
  id: string; // UUID único del item en el carrito
  menu_id: number; // ID del menú
  restaurant_id: number;
  product_id: number;
  product_name: string;
  product_description?: string;
  product_image?: string;
  restaurant_name: string;
  price: number; // Precio unitario del menú
  quantity: number; // Cantidad de items
  subtotal: number; // price * quantity
  created_at?: Date; // Fecha de agregado al carrito
}

/**
 * Payload para agregar items al carrito
 */
export interface AddToCartPayload {
  menu_id: number;
  restaurant_id: number;
  product_id: number;
  product_name: string;
  product_description?: string;
  product_image?: string;
  restaurant_name: string;
  price: number;
  quantity?: number; // Default: 1
}
