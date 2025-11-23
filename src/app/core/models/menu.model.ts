import type { Restaurant } from './restaurant.model';

/**
 * Menu model attributes as provided by backend:
 * id, restaurant_id, product_id, price, availability, created_at, product?, restaurant?
 * Note: products are not modeled globally in this project (per decision). We keep product
 * as an optional unknown object to mirror backend payloads when present.
 */
export interface Menu {
  id: number;
  restaurant_id: number;
  product_id?: number | null;
  price: number;
  availability: boolean;
  created_at?: string | null; // ISO date string
  // optional embedded relations returned by backend
  product?: unknown | null;
  restaurant?: Restaurant | null;
}

export interface MenuCreatePayload {
  restaurant_id: number;
  product_id?: number | null;
  price: number;
  availability?: boolean;
}
