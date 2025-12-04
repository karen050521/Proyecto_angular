import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MotorcycleService } from '../../../core/services/motorcycle.service';
import { Motorcycle, MotorcycleCreatePayload } from '../../../core/models/motorcycle.model';

@Component({
  selector: 'app-drivers',
  imports: [CommonModule, FormsModule],
  templateUrl: './drivers.html',
  styleUrl: './drivers.css',
})
export class DriversListComponent implements OnInit {
  private motorcycleService = inject(MotorcycleService);

  motorcycles: Motorcycle[] = [];
  loading = true;
  error = '';
  showCreateForm = false;
  editingMotorcycle: Motorcycle | null = null;

  formData: MotorcycleCreatePayload = {
    license_plate: '',
    brand: '',
    year: new Date().getFullYear(),
    status: 'available'
  };

  ngOnInit(): void {
    this.loadMotorcycles();
  }

  loadMotorcycles(): void {
    this.loading = true;
    this.motorcycleService.getAll().subscribe({
      next: (data) => {
        this.motorcycles = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar repartidores';
        this.loading = false;
        console.error(err);
      }
    });
  }

  saveMotorcycle(event: Event): void {
    event.preventDefault();
    
    if (this.editingMotorcycle) {
      // Actualizar
      this.motorcycleService.update(this.editingMotorcycle.id, this.formData).subscribe({
        next: () => {
          this.loadMotorcycles();
          this.cancelEdit();
        },
        error: (err) => {
          this.error = 'Error al actualizar repartidor';
          console.error(err);
        }
      });
    } else {
      // Crear
      this.motorcycleService.create(this.formData).subscribe({
        next: () => {
          this.loadMotorcycles();
          this.cancelEdit();
        },
        error: (err) => {
          this.error = 'Error al crear repartidor';
          console.error(err);
        }
      });
    }
  }

  editMotorcycle(motorcycle: Motorcycle): void {
    this.editingMotorcycle = motorcycle;
    this.formData = {
      license_plate: motorcycle.license_plate,
      brand: motorcycle.brand,
      year: motorcycle.year,
      status: motorcycle.status
    };
    this.showCreateForm = false;
  }

  deleteMotorcycle(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este repartidor?')) {
      return;
    }

    this.motorcycleService.delete(id).subscribe({
      next: () => {
        this.loadMotorcycles();
      },
      error: (err) => {
        this.error = 'Error al eliminar repartidor';
        console.error(err);
      }
    });
  }

  cancelEdit(): void {
    this.showCreateForm = false;
    this.editingMotorcycle = null;
    this.formData = {
      license_plate: '',
      brand: '',
      year: new Date().getFullYear(),
      status: 'available'
    };
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      available: 'Disponible',
      in_use: 'En uso',
      maintenance: 'Mantenimiento'
    };
    return labels[status] || status;
  }
}


