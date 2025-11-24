import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Customer } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/customers`;

  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.base);
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.base}/${id}`);
  }

  create(data: Omit<Customer, 'id' | 'created_at'>): Observable<Customer> {
    return this.http.post<Customer>(this.base, data);
  }

  update(id: number, data: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}