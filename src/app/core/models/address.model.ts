export interface Address {
  id?: number;
  order_id?: number;  // Opcional - se asigna al crear la orden
  user_id?: number;   // Opcional - para direcciones guardadas del usuario
  street: string;
  city: string;
  state: string;
  postal_code: string;
  additional_info?: string;
  created_at?: string;
}