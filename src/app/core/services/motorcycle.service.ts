import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Motorcycle, MotorcycleCreatePayload } from '../models/motorcycle.model';

@Injectable({ providedIn: 'root' })
export class MotorcycleService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/motorcycles`;

  getAll(): Observable<Motorcycle[]> {
    return this.http.get<Motorcycle[]>(this.base);
  }

  getById(id: number): Observable<Motorcycle> {
    return this.http.get<Motorcycle>(`${this.base}/${id}`);
  }

  create(payload: MotorcycleCreatePayload): Observable<Motorcycle> {
    return this.http.post<Motorcycle>(this.base, payload);
  }

  update(id: number, payload: Partial<MotorcycleCreatePayload>): Observable<Motorcycle> {
    return this.http.put<Motorcycle>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
