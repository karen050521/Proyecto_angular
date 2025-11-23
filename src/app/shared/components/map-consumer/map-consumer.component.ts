import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MapService } from '../../../infrastructure/maps/map.service'; // <- actualizar si moviste el servicio

@Component({
  selector: 'app-map-consumer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-consumer.component.html',
  styleUrls: ['./map-consumer.component.css'],
})
export class MapConsumerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapHost', { static: true }) mapHost!: ElementRef<HTMLElement>;

  constructor(private mapService: MapService) {}

  async ngAfterViewInit() {
    try {
      await this.mapService.initMap(this.mapHost.nativeElement, 5.0689, -75.5174, 13);
      this.mapService.addMarker(5.0689, -75.5174, 'Manizales - Centro');
    } catch (err) {
      console.error('Error inicializando mapa', err);
    }
  }

  ngOnDestroy() {
    this.mapService.destroy();
  }
}
