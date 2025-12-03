import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Menu, MenuCreatePayload } from '../models/menu.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/api/menus`;

  getAll(): Observable<Menu[]> {
    return this.http.get<Menu[]>(this.base);
  }

  getById(id: number): Observable<Menu> {
    return this.http.get<Menu>(`${this.base}/${id}`);
  }

  create(payload: MenuCreatePayload): Observable<Menu> {
    return this.http.post<Menu>(this.base, payload);
  }

  update(id: number, payload: Partial<MenuCreatePayload>): Observable<Menu> {
    return this.http.put<Menu>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
