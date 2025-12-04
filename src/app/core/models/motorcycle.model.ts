export type MotorcycleStatus = 'available' | 'in_use' | 'maintenance';

/**
 * Motorcycle model (attributes provided):
 * id, license_plate, brand, year, status, created_at
 */
export interface Motorcycle {
  id: number;
  license_plate: string;
  brand: string;
  year: number;
  status: MotorcycleStatus;
  driver_name?: string; // Nombre del conductor
  created_at?: string | null; // ISO date string
}

export interface MotorcycleCreatePayload {
  license_plate: string;
  brand: string;
  year: number;
  status?: MotorcycleStatus;
}
