import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Shift } from '../models/shift.model';

@Injectable({ providedIn: 'root' })
export class ShiftService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/shifts`;

  getAll(): Observable<Shift[]> {
    return this.http.get<Shift[]>(this.base);
  }

  getById(id: number): Observable<Shift> {
    return this.http.get<Shift>(`${this.base}/${id}`);
  }

  create(shift: Omit<Shift, 'id' | 'created_at' | 'driver' | 'motorcycle'>): Observable<Shift> {
    return this.http.post<Shift>(this.base, shift);
  }

  update(id: number, shift: Partial<Shift>): Observable<Shift> {
    return this.http.put<Shift>(`${this.base}/${id}`, shift);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
