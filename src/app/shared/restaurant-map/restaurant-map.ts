import { Component, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from '../../infrastructure/maps/map.service';


@Component({
  selector: 'app-restaurant-map',
  imports: [CommonModule],
  templateUrl: './restaurant-map.html',
  styleUrl: './restaurant-map.css',
})
export class RestaurantMapComponent implements OnInit, OnDestroy {
  private mapService = inject(MapService);

  @Input() restaurantName?: string;
  @Input() address?: string;
  @Input() latitude = 5.0689; // Coordenadas por defecto (Armenia, Colombia)
  @Input() longitude = -75.5174;
  @Input() height = 400;

  ngOnInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
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
      const motorcycleIcon = await this.createMotorcycleIcon();

      // Agregar marcador con icono de moto
      this.mapService.addMarker(
        this.latitude,
        this.longitude,
        this.createPopupContent(),
        'restaurant',
        { icon: motorcycleIcon }
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

    // Crear un icono HTML personalizado con el ícono de moto
    return L.divIcon({
      html: `
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <i class="bi bi-motorcycle" style="
            color: white;
            font-size: 20px;
          "></i>
        </div>
      `,
      className: 'custom-motorcycle-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  }

  private createPopupContent(): string {
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
}
