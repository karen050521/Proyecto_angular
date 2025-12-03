import { Motorcycle } from './motorcycle.model';
import { Photo } from './photo.model';

export interface Issue {
  id: number;
  motorcycle_id: number;
  description: string;
  issue_type: 'accident' | 'breakdown' | 'maintenance';
  date_reported: string | null;
  status: 'open' | 'in_progress' | 'resolved';
  created_at?: string | null;
  photos: Photo[];
}
