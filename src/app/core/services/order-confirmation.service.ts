import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { Order } from '../models/order.model';
import { environment } from '../../../environments/environment';
import { MotorcycleService } from './motorcycle.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private motorcycleService = inject(MotorcycleService);
  private base = `${environment.apiBase}/orders`;

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(this.base);
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  create(data: Omit<Order, 'id' | 'created_at' | 'address' | 'customer' | 'menu'>): Observable<Order> {
    return this.http.post<Order>(this.base, data).pipe(
      tap(order => {
        // Si la orden tiene un repartidor asignado, iniciar tracking
        if (order.motorcycle_id && order.motorcycle) {
          const plate = order.motorcycle.license_plate;
          console.log(`🚀 Iniciando tracking automático para ${plate}`);
          this.motorcycleService.startTracking(plate).subscribe({
            next: () => console.log(`✅ Tracking iniciado para ${plate}`),
            error: (err) => console.error(`❌ Error al iniciar tracking para ${plate}:`, err)
          });
        }
      })
    );
  }

  update(id: number, data: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.base}/${id}`, data).pipe(
      switchMap(updatedOrder => {
        // Si se está asignando un repartidor (motorcycle_id), iniciar tracking
        if (data.motorcycle_id && !data.status) {
          // Obtener información completa de la orden para tener los datos de la moto
          return this.getById(id).pipe(
            tap(fullOrder => {
              if (fullOrder.motorcycle) {
                const plate = fullOrder.motorcycle.license_plate;
                console.log(`🚀 Iniciando tracking automático para ${plate}`);
                this.motorcycleService.startTracking(plate).subscribe({
                  next: () => console.log(`✅ Tracking iniciado para ${plate}`),
                  error: (err) => console.error(`❌ Error al iniciar tracking:`, err)
                });
              }
            })
          );
        }
        
        // Si se está completando la orden, detener tracking
        if (data.status === 'delivered' || data.status === 'cancelled') {
          return this.getById(id).pipe(
            tap(fullOrder => {
              if (fullOrder.motorcycle) {
                const plate = fullOrder.motorcycle.license_plate;
                console.log(`🛑 Deteniendo tracking para ${plate}`);
                this.motorcycleService.stopTracking(plate).subscribe({
                  next: () => console.log(`✅ Tracking detenido para ${plate}`),
                  error: (err) => console.error(`❌ Error al detener tracking:`, err)
                });
              }
            })
          );
        }
        
        return new Observable<Order>(observer => {
          observer.next(updatedOrder);
          observer.complete();
        });
      })
    );
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}