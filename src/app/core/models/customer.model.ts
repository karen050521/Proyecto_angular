export interface Customer {
  id?: number;           // Opcional al crear
  name: string;
  email: string;
  phone: string;
  created_at?: string;   // Opcional, lo asigna el backend
}