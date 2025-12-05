import { Component, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from '../../infrastructure/maps/map.service';
import { WebsocketService, Coordinates } from '../../core/services/websocket.service';
import { MotorcycleService } from '../../core/services/motorcycle.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-restaurant-map',
  imports: [CommonModule],
  templateUrl: './restaurant-map.html',
  styleUrl: './restaurant-map.css',
})
export class RestaurantMapComponent implements OnInit, OnDestroy {
  private mapService = inject(MapService);
  private websocketService = inject(WebsocketService);
  private motorcycleService = inject(MotorcycleService);

  @Input() restaurantName?: string;
  @Input() address?: string;
  @Input() latitude = 5.0689; // Coordenadas por defecto (Armenia, Colombia)
  @Input() longitude = -75.5174;
  @Input() height = 400;
  
  // Nuevos inputs para tracking de motocicleta
  @Input() trackingMode = false; // Si es true, activa el modo tracking
  @Input() motorcyclePlate?: string; // Placa de la moto a trackear
  @Input() autoStart = false; // Si es true, inicia tracking automáticamente

  private trackingSubscription?: Subscription;
  private motorcycleMarker?: any;
  private currentIcon?: any;

  ngOnInit(): void {
    this.initializeMap();
    
    // Si está en modo tracking y tiene placa, iniciar automáticamente
    if (this.trackingMode && this.motorcyclePlate && this.autoStart) {
      this.startTracking();
    }
  }

  ngOnDestroy(): void {
    this.stopTracking();
    this.mapService.destroy();
  }

  private async initializeMap(): Promise<void> {
    try {
      // Inicializar el mapa
      await this.mapService.initMap(
        'restaurant-map',
        this.latitude,
        this.longitude,
        15
      );

      // Crear icono personalizado de moto
      this.currentIcon = await this.createMotorcycleIcon();

      // Agregar marcador con icono de moto
      this.motorcycleMarker = this.mapService.addMarker(
        this.latitude,
        this.longitude,
        this.createPopupContent(),
        'motorcycle',
        { icon: this.currentIcon }
      );

    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
    }
  }

  private async createMotorcycleIcon(): Promise<any> {
    const L = (this.mapService as any).L;
    
    if (!L) {
      throw new Error('Leaflet no está cargado');
    }

    // Usando ícono de Lucide para moto - SVG de Bike
    const iconSvg = this.trackingMode 
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bike"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`
      : `<i class="bi bi-shop" style="color: white; font-size: 20px;"></i>`;

    const bgGradient = this.trackingMode
      ? 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)' // Azul para delivery
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // Morado para restaurante

    // Crear un icono HTML personalizado
    return L.divIcon({
      html: `
        <div style="position: relative; width: 50px; height: 50px;">
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            background: ${bgGradient};
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            overflow: visible;
          ">
            ${iconSvg}
            ${this.trackingMode ? `
              <div style="
                position: absolute;
                top: -4px;
                left: -4px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: 3px solid rgba(74, 144, 226, 0.6);
                animation: ripple 2s infinite;
              "></div>
            ` : ''}
          </div>
        </div>
        <style>
          @keyframes ripple {
            0% { 
              transform: scale(1);
              opacity: 1;
            }
            100% { 
              transform: scale(1.6);
              opacity: 0;
            }
          }
        </style>
      `,
      className: 'custom-delivery-marker',
      iconSize: [50, 50],
      iconAnchor: [25, 25],
      popupAnchor: [0, -25]
    });
  }

  private createPopupContent(): string {
    if (this.trackingMode && this.motorcyclePlate) {
      return `
        <div style="padding: 0.5rem;">
          <h4 style="margin: 0 0 0.5rem 0; color: #4A90E2; display: flex; align-items: center; gap: 0.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bike"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
            ${this.motorcyclePlate}
          </h4>
          <p style="margin: 0; color: #666; font-size: 0.9rem;">
            <i class="bi bi-geo-alt-fill"></i> En ruta hacia tu ubicación
          </p>
          <p style="margin: 0.25rem 0 0 0; color: #28a745; font-size: 0.85rem;">
            <i class="bi bi-broadcast"></i> Tracking GPS activo
          </p>
        </div>
      `;
    }
    
    const name = this.restaurantName || 'Restaurante';
    const addr = this.address || 'Dirección no especificada';
    
    return `
      <div style="padding: 0.5rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: #333;">
          <i class="bi bi-shop"></i> ${name}
        </h4>
        <p style="margin: 0; color: #666; font-size: 0.9rem;">
          <i class="bi bi-geo-alt"></i> ${addr}
        </p>
      </div>
    `;
  }

  /**
   * Inicia el tracking en tiempo real de la motocicleta
   */
  startTracking(): void {
    if (!this.motorcyclePlate) {
      console.error('❌ No se puede iniciar tracking: falta la placa');
      return;
    }

    console.log(`🚀 Iniciando tracking de ${this.motorcyclePlate}`);

    // 1. Iniciar tracking en el backend
    this.motorcycleService.startTracking(this.motorcyclePlate).subscribe({
      next: (response) => {
        console.log('✅ Backend respondió:', response);
        
        // 2. Escuchar coordenadas por WebSocket
        this.trackingSubscription = this.websocketService
          .listenToPlate(this.motorcyclePlate!)
          .subscribe({
            next: (coords: Coordinates) => {
              this.updateMotorcyclePosition(coords);
              this.playNotificationSound();
            },
            error: (error) => {
              console.error('❌ Error en WebSocket:', error);
            }
          });
      },
      error: (error) => {
        console.error('❌ Error al iniciar tracking:', error);
      }
    });
  }

  /**
   * Detiene el tracking de la motocicleta
   */
  stopTracking(): void {
    if (!this.motorcyclePlate) {
      return;
    }

    console.log(`🛑 Deteniendo tracking de ${this.motorcyclePlate}`);

    // Detener tracking en backend
    this.motorcycleService.stopTracking(this.motorcyclePlate).subscribe({
      next: (response) => {
        console.log('✅ Tracking detenido:', response);
      },
      error: (error) => {
        console.error('❌ Error al detener tracking:', error);
      }
    });

    // Desuscribirse del WebSocket
    if (this.trackingSubscription) {
      this.trackingSubscription.unsubscribe();
      this.trackingSubscription = undefined;
    }
  }

  /**
   * Actualiza la posición del marcador en el mapa
   */
  private updateMotorcyclePosition(coords: Coordinates): void {
    console.log(`📍 Actualizando posición a [${coords.lat}, ${coords.lng}]`);

    if (this.motorcycleMarker) {
      // Actualizar posición del marcador
      this.mapService.updateMarkerPosition('motorcycle', coords.lat, coords.lng);
      
      // Centrar el mapa en la nueva posición
      this.mapService.centerMap(coords.lat, coords.lng);
    }
  }

  /**
   * Reproduce un sonido de notificación
   */
  private playNotificationSound(): void {
    try {
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGJ0fDTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMmBSl+zPLaizsIGGS57OWcTgwKUrDp8bllHAU2jdXuzogzBhxsvO7mnEoODlOq6O+zYhkHPZnZ8sZyJwUnfMrx2Ik5CBdguuznmlANClGu6PKxYxoFM4vU8c+GNQYaabzs5ppNDg5RqefvtWMZBzuZ2PLGcigFJ3vJ8dmJOQgXYLjs5ppQDAo+kNXxy3UqBSF1xPDajz0KFV+16Oy0ZRwGM43U8c+GNQYaaLns5ZlODg5RqOfws2MaBzuZ2PLGcSgFKHvJ8dmKOQgXYLjs5ppPDQo+kNXxy3UqBSF1xPDajz0KFV+16Oy0ZRwGM43U8c+GNQYaaLrs5ZpODg5RqObws2MaBzuY2PLGcSgFKHvJ8dmKOQgWX7js5ppPDQo+kNXxy3UqBSF1xPDajz0KFV+16Oy0ZRsGNI3T8c+GNQYaaLrs5ZpPDg1PqubwsmIaBjiY1/LGcSgFKHvJ8dqJOQgXX7js5ppPDQo/kNXxy3UqBSF1xPDajz0KFV+06Oy0ZRsGNI3T8c+GNQYaaLrs5ZpPDg1PqubwsmIaBjiY1/LGcSgFKHvJ8dqJOQgXX7js5ppPDQo/kNXxy3UqBSF1xPDajz0KFV+06Oy0ZRsGNI3T8c+GNQYaaLrs5ZpPDg1PqubwsmIaBjiY1/LGcSgFKHvJ8dqJOQgXX7js5ppPDQo/kNXxy3UqBSF1xPDajz0KFV+06Oy0ZRsGNI3T8c+GNQYaaLrs5ZpPDg1PqubwsmIaBjiY1/LGcSgFKHvJ8dqJOQgXX7js5ppPDQo/kNXxy3UqBSF1xPDajz0KFV+06Oy0ZRsGNI3T8c+GNQYaaLrs5ZpPDg1PqubwsmIaBjiY1/LGcSgFKHvJ8dqJOQgXX7js5ppPDQo/kNXxy3UqBSF1xPDajz0KFV+06Oy0ZRsGNI3T8c+GNQYaaLrs5ZpPDg1PqubwsmIaBjiY1/LGcSgFKHvJ8dqJOQgXX7js5ppPDQo/kNXxy3UqBSF1xPDajz0KFV+06Oy0ZRsGNI3T8c+GNQYaaLrs5ZpPDg1PqubwsmIaBjiY1/LGcSgFKHvJ8dqJOQgXX7js5ppPDQo/kNXxy3UqBSF1xPDajz0KFV+06Oy0ZRsGNI3T8c+GNQYaaLrs5ZpPDg1PqubwsmIaBjiY1/LGcSgFKHvJ8dqJOQgXX7js5ppPDQo/kNXxy3UqBSF1xPDajz0KFV+06Oy0ZRsGNI3T8c+GNQYaaLrs5ZpPDg1PqubwsmIaBjiY1/LGcSgFKHvJ8dqJOQgXX7js5ppPDQo/kNXxy3UqBSF1xPDajz0KFV+06Oy0ZRsGNI3T8c+GNQYaaLrs5ZpPDg1PqubwsmIaBjiY1/LGcSgFKHvJ8dqJOQgXX7js5ppPDQo/kNXxy3UqBSF1xPDajz0KFV+06Oy0ZRsGNI3T8c+GNQYaaLrs5ZpPDg1PqubwsmIaBjiY1/LGcSgFKHvJ8dqJOQgXX7js5ppPDQo/kNXxy3UqBSF1xPDajz0KFV+06Oy0ZRsG';
      audio.play().catch(e => console.log('No se pudo reproducir el sonido:', e));
    } catch (error) {
      // Silenciar errores de audio
    }
  }
}
