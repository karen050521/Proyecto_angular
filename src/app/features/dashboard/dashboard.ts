import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsService, AllChartsResponse } from '../../core/services/charts.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  loading = true;
  error = false;

  // Estadísticas
  estadisticas: any = null;

  // Configuraciones de gráficos circulares
  piePedidosEstadoData: ChartConfiguration<'pie'>['data'] | null = null;
  pieProductosVendidosData: ChartConfiguration<'pie'>['data'] | null = null;
  pieMotosEstadoData: ChartConfiguration<'pie'>['data'] | null = null;

  // Configuraciones de gráficos de barras
  barPedidosRestauranteData: ChartConfiguration<'bar'>['data'] | null = null;
  barConductoresActivosData: ChartConfiguration<'bar'>['data'] | null = null;
  barIncidentesMesData: ChartConfiguration<'bar'>['data'] | null = null;

  // Configuraciones de gráficos de línea
  linePedidosDiariosData: ChartConfiguration<'line'>['data'] | null = null;
  lineIngresosMensualesData: ChartConfiguration<'line'>['data'] | null = null;
  lineTiempoEntregaData: ChartConfiguration<'line'>['data'] | null = null;

  // Opciones comunes
  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  constructor(private chartsService: ChartsService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading = true;
    this.error = false;

    this.chartsService.getAllCharts().subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response);

        // Calcular estadísticas generales
        this.estadisticas = {
          totalPedidos: 208, // Suma de pedidosEstado
          pedidosHoy: 45,
          ingresosTotal: 850000,
          ingresosHoy: 105000,
          clientesActivos: 1250,
          restaurantesActivos: 10,
          promedioEntrega: '38 min',
          tasaSatisfaccion: 4.7
        };

        // Gráficos circulares - transformar datos
        this.piePedidosEstadoData = this.transformPieData(response.pie.pedidosEstado);
        this.pieProductosVendidosData = this.transformPieData(response.pie.productosVendidos);
        this.pieMotosEstadoData = this.transformPieData(response.pie.motosEstado);

        // Gráficos de barras - ya vienen en formato correcto
        this.barPedidosRestauranteData = response.bar.pedidosRestaurante;
        this.barConductoresActivosData = response.bar.conductoresActivos;
        this.barIncidentesMesData = response.bar.incidentesMes;

        // Gráficos de línea - ya vienen en formato correcto
        this.linePedidosDiariosData = response.line.pedidosDiarios;
        this.lineIngresosMensualesData = response.line.ingresosMensuales;
        this.lineTiempoEntregaData = response.line.tiempoEntrega;

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos del dashboard:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  // Transformar datos de pie charts del formato del servidor al formato de Chart.js
  private transformPieData(data: any): ChartConfiguration<'pie'>['data'] {
    return {
      labels: data.data.map((item: any) => item.label),
      datasets: [{
        data: data.data.map((item: any) => item.value),
        backgroundColor: data.data.map((item: any) => item.color)
      }]
    };
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-CO').format(value);
  }
}
