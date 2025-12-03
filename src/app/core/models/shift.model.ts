import { Driver } from './driver.model';
import { Motorcycle } from './motorcycle.model';

export interface Shift {
  id: number;
  driver_id: number;
  motorcycle_id: number;
  start_time: string;
  end_time?: string | null;
  status: 'active' | 'completed' | 'cancelled';
  created_at?: string | null;
  driver?: Driver | null;
  motorcycle?: Motorcycle | null;
}
