import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Restaurant, RestaurantCreatePayload } from '../models/restaurant.model';

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/restaurants`;

  getAll(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(this.base);
  }

  getById(id: number): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.base}/${id}`);
  }

  create(payload: RestaurantCreatePayload): Observable<Restaurant> {
    return this.http.post<Restaurant>(this.base, payload);
  }

  update(id: number, payload: Partial<RestaurantCreatePayload>): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
