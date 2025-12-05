import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

export interface Coordinates {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket | null = null;
  private connected = false;

  constructor() {
    this.connect();
  }

  /**
   * Conecta al servidor WebSocket
   */
  private connect(): void {
    if (this.socket) {
      return;
    }

    try {
      this.socket = io(environment.trackingServer || 'http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket conectado al servidor de tracking');
        this.connected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('❌ WebSocket desconectado');
        this.connected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Error de conexión WebSocket:', error);
      });

      // Debug: Escuchar TODOS los eventos para ver qué llega
      this.socket.onAny((eventName, ...args) => {
        console.log(`🔔 Evento WebSocket recibido: "${eventName}"`, args);
      });
    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
    }
  }

  /**
   * Escucha las coordenadas de una placa específica
   * @param plate Placa de la motocicleta (ej: "ABC124")
   * @returns Observable con las coordenadas en tiempo real
   */
  listenToPlate(plate: string): Observable<Coordinates> {
    return new Observable<Coordinates>(observer => {
      if (!this.socket) {
        observer.error('WebSocket no conectado');
        return;
      }

      console.log(`🎧 Escuchando coordenadas de la placa: ${plate}`);

      // Función handler para procesar los datos
      const handleCoordinates = (data: any) => {
        console.log(`📍 [${plate}] Dato recibido del WebSocket:`, data);
        
        // Validar que tenga las propiedades necesarias
        if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
          console.log(`✅ [${plate}] Coordenadas válidas:`, { lat: data.lat, lng: data.lng });
          observer.next({ lat: data.lat, lng: data.lng });
        } else {
          console.warn(`⚠️ [${plate}] Datos inválidos recibidos:`, data);
        }
      };

      // Escuchar eventos con el nombre de la placa
      this.socket.on(plate, handleCoordinates);
      
      // También escuchar cualquier otro evento para debug
      console.log('📡 Eventos activos del socket:', Object.keys((this.socket as any)._callbacks || {}));

      // Cleanup cuando se desuscribe
      return () => {
        if (this.socket) {
          console.log(`🔇 Dejando de escuchar placa: ${plate}`);
          this.socket.off(plate, handleCoordinates);
        }
      };
    });
  }

  /**
   * Desconecta del servidor WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Verifica si está conectado
   */
  isConnected(): boolean {
    return this.connected;
  }
}
