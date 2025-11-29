
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-products-view',
  imports: [CommonModule],
  templateUrl: './products-view.html',
  styleUrl: './products-view.css',
})
export class ProductsView implements OnInit {
  private productService = inject(ProductService);

  products: Product[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar productos';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
