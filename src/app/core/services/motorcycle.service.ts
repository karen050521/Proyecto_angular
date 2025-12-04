import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, of } from 'rxjs';
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

  /**
   * Obtiene repartidores disponibles
   */
  getAvailable(): Observable<Motorcycle[]> {
    return this.getAll().pipe(
      map(motorcycles => motorcycles.filter(m => m.status === 'available'))
    );
  }

  /**
   * Asigna un repartidor disponible al azar y lo marca como "en uso"
   */
  assignRandomDriver(): Observable<Motorcycle | null> {
    return this.getAvailable().pipe(
      map(available => {
        if (available.length === 0) {
          console.warn('⚠️ No hay conductores disponibles');
          return null;
        }
        
        // Seleccionar uno al azar
        const randomIndex = Math.floor(Math.random() * available.length);
        const selected = available[randomIndex];
        console.log('✅ Conductor seleccionado:', selected);
        
        return selected;
      }),
      // Actualizar el estado del conductor
      switchMap(selected => {
        if (!selected) {
          return of(null);
        }
        
        // Marcar como en uso y devolver el conductor actualizado
        return this.update(selected.id, { status: 'in_use' }).pipe(
          map(updated => {
            console.log('✅ Conductor marcado como en uso:', updated);
            return updated;
          })
        );
      })
    );
  }
}

