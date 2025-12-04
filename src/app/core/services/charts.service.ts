import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChartData {
  labels: string[];
  datasets: any[];
}

export interface ChartResponse {
  success: boolean;
  data: ChartData;
  tipo: string;
}

export interface AllChartsResponse {
  success: boolean;
  data: {
    estadisticas: {
      totalPedidos: number;
      pedidosHoy: number;
      ingresosTotal: number;
      ingresosHoy: number;
      clientesActivos: number;
      restaurantesActivos: number;
      promedioEntrega: string;
      tasaSatisfaccion: number;
    };
    pie: any;
    bar: any;
    line: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ChartsService {
  private baseUrl = 'http://localhost:3001/api/charts';

  constructor(private http: HttpClient) { }

  // Gráficos circulares - Endpoints específicos
  getPedidosEstado(): Observable<ChartResponse> {
    return this.http.get<ChartResponse>(`${this.baseUrl}/pie/pedidos-estado`);
  }

  getProductosVendidos(): Observable<ChartResponse> {
    return this.http.get<ChartResponse>(`${this.baseUrl}/pie/productos-vendidos`);
  }

  getMotosEstado(): Observable<ChartResponse> {
    return this.http.get<ChartResponse>(`${this.baseUrl}/pie/motos-estado`);
  }

  // Gráficos de barras - Endpoints específicos
  getPedidosRestaurante(): Observable<ChartResponse> {
    return this.http.get<ChartResponse>(`${this.baseUrl}/bar/pedidos-restaurante`);
  }

  getConductoresActivos(): Observable<ChartResponse> {
    return this.http.get<ChartResponse>(`${this.baseUrl}/bar/conductores-activos`);
  }

  getIncidentesMes(): Observable<ChartResponse> {
    return this.http.get<ChartResponse>(`${this.baseUrl}/bar/incidentes-mes`);
  }

  // Gráficos de línea - Endpoints específicos
  getPedidosDiarios(): Observable<ChartResponse> {
    return this.http.get<ChartResponse>(`${this.baseUrl}/line/pedidos-diarios`);
  }

  getIngresosMensuales(): Observable<ChartResponse> {
    return this.http.get<ChartResponse>(`${this.baseUrl}/line/ingresos-mensuales`);
  }

  getTiempoEntrega(): Observable<ChartResponse> {
    return this.http.get<ChartResponse>(`${this.baseUrl}/line/tiempo-entrega`);
  }

  // Métodos genéricos (por si los necesitas)
  getPieChart(tipo: string): Observable<ChartResponse> {
    return this.http.get<ChartResponse>(`${this.baseUrl}/pie/${tipo}`);
  }

  getBarChart(tipo: string): Observable<ChartResponse> {
    return this.http.get<ChartResponse>(`${this.baseUrl}/bar/${tipo}`);
  }

  getLineChart(tipo: string): Observable<ChartResponse> {
    return this.http.get<ChartResponse>(`${this.baseUrl}/line/${tipo}`);
  }

  // Todos los datos
  getAllCharts(): Observable<AllChartsResponse> {
    return this.http.get<AllChartsResponse>(`${this.baseUrl}/all`);
  }
}
