export interface Photo {
  id: number;
  issue_id: number;
  image_url: string;
  caption?: string | null;
  taken_at?: string | null;
  created_at?: string | null;
}
