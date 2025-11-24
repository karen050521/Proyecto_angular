import { Address } from './address.model';
import { Customer } from './customer.model';
import { Menu } from './menu.model';

export interface Order {
  id?: number;
  customer_id: number;
  menu_id: number;
  motorcycle_id?: number;
  quantity: number;
  total_price: number;
  status: 'pending' | 'in_progress' | 'delivered' | 'cancelled';
  created_at?: string;
  address?: Address;
  customer?: Customer;
  menu?: Menu;
}