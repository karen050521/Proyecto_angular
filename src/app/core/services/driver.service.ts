import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Driver } from '../models/driver.model';

@Injectable({ providedIn: 'root' })
export class DriverService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/drivers`;

  getAll(): Observable<Driver[]> {
    return this.http.get<Driver[]>(this.base);
  }

  getById(id: number): Observable<Driver> {
    return this.http.get<Driver>(`${this.base}/${id}`);
  }

  create(driver: Omit<Driver, 'id' | 'created_at'>): Observable<Driver> {
    return this.http.post<Driver>(this.base, driver);
  }

  update(id: number, driver: Partial<Driver>): Observable<Driver> {
    return this.http.put<Driver>(`${this.base}/${id}`, driver);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
