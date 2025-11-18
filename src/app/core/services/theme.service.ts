import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  
  // Signal para el tema actual
  currentTheme = signal<Theme>(this.getInitialTheme());

  constructor() {
    // Aplicar el tema inicial
    this.applyTheme(this.currentTheme());
  }

  private getInitialTheme(): Theme {
    // Intentar obtener el tema guardado en localStorage
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    
    // Si no hay tema guardado, usar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light'; // Por defecto modo claro
  }

  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  private applyTheme(theme: Theme): void {
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(theme);
  }

  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }
}
