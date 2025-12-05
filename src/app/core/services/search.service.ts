import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

/**
 * Resultado de búsqueda unificado
 */
export interface SearchResult {
  id: number;
  type: 'menu' | 'restaurant' | 'order' | 'motorcycle';
  title: string;
  subtitle?: string;
  image?: string;
  relevance: number; // 0-100, mayor es mejor
  matchedTerms: string[];
}

/**
 * Diccionario multiidioma para búsquedas
 */
const TRANSLATIONS: { [key: string]: string[] } = {
  // Comida en español e inglés
  'pizza': ['pizza', 'pizzas'],
  'hamburguesa': ['hamburger', 'burger', 'hamburguesa', 'hamburguesas'],
  'empanada': ['empanada', 'empanadas', 'turnover', 'pastry'],
  'tacos': ['tacos', 'taco'],
  'sushi': ['sushi', 'roll', 'rolls'],
  'ensalada': ['salad', 'ensalada', 'ensaladas'],
  'bebida': ['drink', 'beverage', 'bebida', 'bebidas'],
  'postre': ['dessert', 'postre', 'postres'],
  'pasta': ['pasta', 'noodles'],
  'pollo': ['chicken', 'pollo'],
  'carne': ['meat', 'beef', 'carne'],
  'pescado': ['fish', 'pescado'],
  'vegetariano': ['vegetarian', 'veggie', 'vegetariano'],
  'vegano': ['vegan', 'vegano'],
  
  // Estados de pedido
  'pendiente': ['pending', 'pendiente'],
  'proceso': ['in progress', 'processing', 'en proceso'],
  'entregado': ['delivered', 'entregado'],
  'cancelado': ['cancelled', 'canceled', 'cancelado'],
  
  // Otros términos comunes
  'restaurante': ['restaurant', 'restaurante', 'restaurantes'],
  'pedido': ['order', 'pedido', 'pedidos'],
  'repartidor': ['driver', 'delivery', 'repartidor', 'conductor'],
  'menu': ['menu', 'menú'],
};

/**
 * Servicio de búsqueda inteligente multiidioma
 */
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchQuery$ = new BehaviorSubject<string>('');
  private allData: SearchResult[] = [];
  
  // Signal para resultados
  results = signal<SearchResult[]>([]);
  isSearching = signal(false);
  
  constructor() {
    // Configurar búsqueda con debounce
    this.searchQuery$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.performSearch(query))
    ).subscribe(results => {
      this.results.set(results);
      this.isSearching.set(false);
    });
  }
  
  /**
   * Actualizar datos para búsqueda
   */
  updateSearchData(data: SearchResult[]): void {
    this.allData = data;
  }
  
  /**
   * Realizar búsqueda
   */
  search(query: string): void {
    this.isSearching.set(true);
    this.searchQuery$.next(query.trim());
  }
  
  /**
   * Limpiar búsqueda
   */
  clear(): void {
    this.searchQuery$.next('');
    this.results.set([]);
  }
  
  /**
   * Búsqueda inteligente con múltiples idiomas
   */
  private performSearch(query: string): Observable<SearchResult[]> {
    if (!query || query.length < 2) {
      return of([]);
    }
    
    const normalizedQuery = this.normalizeText(query);
    const searchTerms = this.expandSearchTerms(normalizedQuery);
    
    const results = this.allData
      .map(item => ({
        ...item,
        relevance: this.calculateRelevance(item, searchTerms, normalizedQuery)
      }))
      .filter(item => item.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10); // Top 10 resultados
    
    return of(results);
  }
  
  /**
   * Expandir términos de búsqueda con traducciones
   */
  private expandSearchTerms(query: string): string[] {
    const words = query.toLowerCase().split(/\s+/);
    const expandedTerms = new Set<string>(words);
    
    // Agregar traducciones
    words.forEach(word => {
      Object.entries(TRANSLATIONS).forEach(([key, translations]) => {
        if (translations.some(t => t.includes(word) || word.includes(t))) {
          translations.forEach(t => expandedTerms.add(t.toLowerCase()));
          expandedTerms.add(key.toLowerCase());
        }
      });
    });
    
    return Array.from(expandedTerms);
  }
  
  /**
   * Calcular relevancia del resultado
   */
  private calculateRelevance(item: SearchResult, searchTerms: string[], originalQuery: string): number {
    let score = 0;
    const itemText = this.normalizeText(`${item.title} ${item.subtitle || ''}`);
    const itemWords = itemText.split(/\s+/);
    
    // Coincidencia exacta en título (máxima relevancia)
    if (itemText.includes(originalQuery)) {
      score += 100;
    }
    
    // Coincidencia al inicio del título
    if (itemText.startsWith(originalQuery)) {
      score += 50;
    }
    
    // Coincidencias por término
    searchTerms.forEach(term => {
      if (itemText.includes(term)) {
        score += 30;
      }
      
      // Palabras individuales
      itemWords.forEach(word => {
        if (word === term) {
          score += 20;
        } else if (word.startsWith(term)) {
          score += 10;
        } else if (word.includes(term)) {
          score += 5;
        }
      });
    });
    
    // Bonus si tiene imagen
    if (item.image) {
      score += 5;
    }
    
    return Math.min(score, 100);
  }
  
  /**
   * Normalizar texto para búsqueda (sin acentos, minúsculas)
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .trim();
  }
}
