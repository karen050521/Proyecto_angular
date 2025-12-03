import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Restaurant } from '../../core/models/restaurant.model';

@Component({
selector: 'app-restaurants-view',
  imports: [CommonModule, RouterModule], // Para usar *ngFor, *ngIf y routerLink
  templateUrl: './restaurants-view.html',
  styleUrl: './restaurants-view.css',
})
export class RestaurantsView implements OnInit {
  private restaurantService = inject(RestaurantService);
  
  restaurants: Restaurant[] = []; // Array para guardar los restaurantes
  loading = true; // Para mostrar "Cargando..."
  error = ''; // Para mostrar errores

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loading = true;
    this.restaurantService.getAll().subscribe({
      next: (data) => {
        this.restaurants = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar restaurantes';
        this.loading = false;
        console.error(err);
      }
    });
  }
}