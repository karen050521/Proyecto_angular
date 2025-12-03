import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Photo } from '../models/photo.model';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/photos`;
  private uploadUrl = `${environment.apiBase}/photos/upload`;

  getAll(): Observable<Photo[]> {
    return this.http.get<Photo[]>(this.base);
  }

  getById(id: number): Observable<Photo> {
    return this.http.get<Photo>(`${this.base}/${id}`);
  }

  create(photo: Omit<Photo, 'id' | 'created_at'>): Observable<Photo> {
    return this.http.post<Photo>(this.base, photo);
  }

  update(id: number, photo: Partial<Photo>): Observable<Photo> {
    return this.http.put<Photo>(`${this.base}/${id}`, photo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  upload(issueId: number, file: File, caption?: string): Observable<Photo> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('issue_id', String(issueId));
    if (caption) {
      formData.append('caption', caption);
    }
    return this.http.post<Photo>(this.uploadUrl, formData);
  }
}
