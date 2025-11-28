/**
 * Restaurant model
 * Attributes provided by backend (kept minimal and typed):
 * {
 *   id, name, address, phone, email, created_at
 * }
 */
export interface Restaurant {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  created_at?: string | null; // ISO date string
  imageUrl?: string | null; // URL de la imagen del restaurante
}

export interface RestaurantCreatePayload {
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}
