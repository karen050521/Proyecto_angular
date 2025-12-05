import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private L: any = null;
  private map: any = null;
  private markers: Map<string, any> = new Map();

  private async loadLeaflet(): Promise<any> {
    if (this.L) return this.L;
    const leaflet = await import('leaflet');

    // asegurar rutas absolutas (base href + origin)
    const base = document.querySelector('base')?.getAttribute('href') ?? '/';
    const origin =
      typeof window !== 'undefined' && window.location && window.location.origin
        ? window.location.origin
        : '';
    const prefix = `${origin}${base.replace(/\/$/, '')}`;

    (leaflet as any).Icon.Default.mergeOptions({
      iconRetinaUrl: `${prefix}/assets/leaflet/marker-icon-2x.png`,
      iconUrl: `${prefix}/assets/leaflet/marker-icon.png`,
      shadowUrl: `${prefix}/assets/leaflet/marker-shadow.png`,
    });

    this.L = leaflet;
    return this.L;
  }

  // Inicializa el mapa en un elemento (id o HTMLElement)
  async initMap(
    target: string | HTMLElement,
    lat = 5.0689,
    lng = -75.5174,
    zoom = 13,
    tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  ) {
    const L = await this.loadLeaflet();
    const el =
      typeof target === 'string' ? document.getElementById(target) : (target as HTMLElement);
    if (!el) throw new Error('Elemento objetivo para el mapa no encontrado');

    if (this.map) {
      this.map.remove();
      this.map = null;
      this.markers.clear();
    }

    this.map = L.map(el).setView([lat, lng], zoom);
    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    return this.map;
  }

  // Añade un marcador con id opcional (si se pasa id, permite actualizarlo luego)
  addMarker(lat: number, lng: number, popupText?: string, id?: string, options?: any) {
    if (!this.map || !this.L) return null;
    const marker = this.L.marker([lat, lng], options).addTo(this.map);
    if (popupText) marker.bindPopup(popupText);
    if (id) this.markers.set(id, marker);
    return marker;
  }

  // Actualiza marcador existente por id (o crea si no existe)
  updateMarkerPosition(id: string, lat: number, lng: number, popupText?: string) {
    if (!this.L) return null;
    const existing = this.markers.get(id);
    if (existing) {
      existing.setLatLng([lat, lng]);
      if (popupText) existing.bindPopup(popupText);
      return existing;
    } else {
      return this.addMarker(lat, lng, popupText, id);
    }
  }

  getMarker(id: string) {
    return this.markers.get(id) ?? null;
  }

  removeMarker(id: string) {
    const m = this.markers.get(id);
    if (m) {
      this.map.removeLayer(m);
      this.markers.delete(id);
    }
  }

  clearMarkers() {
    for (const id of Array.from(this.markers.keys())) this.removeMarker(id);
  }

  setView(lat: number, lng: number, zoom?: number) {
    if (!this.map) return;
    this.map.setView([lat, lng], zoom ?? this.map.getZoom());
  }

  centerMap(lat: number, lng: number, zoom?: number) {
    this.setView(lat, lng, zoom);
  }

  fitBounds(bounds: any, options?: any) {
    if (!this.map) return;
    this.map.fitBounds(bounds, options);
  }

  onMapClick(cb: (evt: any) => void) {
    if (!this.map) return;
    this.map.on('click', cb);
  }

  getMap() {
    return this.map;
  }

  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.markers.clear();
    }
  }

  isInitialized() {
    return !!this.map;
  }
}
