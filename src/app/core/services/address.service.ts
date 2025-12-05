import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Address } from '../models/address.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/addresses`;

  getAll(): Observable<Address[]> {
    return this.http.get<Address[]>(this.base);
  }

  getById(id: number): Observable<Address> {
    return this.http.get<Address>(`${this.base}/${id}`);
  }

  /**
   * Obtiene las direcciones de un usuario específico
   * @param userId ID del usuario
   * @returns Observable con las direcciones del usuario
   */
  getUserAddresses(userId: number): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.base}/user/${userId}`);
  }

  create(data: Omit<Address, 'id' | 'created_at'>): Observable<Address> {
    return this.http.post<Address>(this.base, data);
  }

  update(id: number, data: Partial<Address>): Observable<Address> {
    return this.http.put<Address>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}