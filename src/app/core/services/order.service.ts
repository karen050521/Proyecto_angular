import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/orders`;

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(this.base);
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  create(data: Omit<Order, 'id' | 'created_at' | 'address' | 'customer' | 'menu'>): Observable<Order> {
    return this.http.post<Order>(this.base, data);
  }

  update(id: number, data: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}