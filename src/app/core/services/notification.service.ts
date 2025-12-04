import { Injectable } from '@angular/core';

/**
 * NotificationService - Responsabilidad única: mostrar notificaciones al usuario
 * 
 * SRP: Single Responsibility Principle
 * - Solo se encarga de mostrar mensajes/toasts/notificaciones
 * - No maneja lógica de negocio
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  /**
   * Muestra un toast de éxito
   */
  showSuccess(message: string, duration: number = 2000): void {
    this.showToast(message, 'success', duration);
  }
  
  /**
   * Muestra un toast de error
   */
  showError(message: string, duration: number = 3000): void {
    this.showToast(message, 'error', duration);
  }
  
  /**
   * Muestra un toast de información
   */
  showInfo(message: string, duration: number = 2000): void {
    this.showToast(message, 'info', duration);
  }
  
  /**
   * Muestra un toast de advertencia
   */
  showWarning(message: string, duration: number = 2500): void {
    this.showToast(message, 'warning', duration);
  }
  
  /**
   * Implementación interna del toast
   */
  private showToast(
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning', 
    duration: number
  ): void {
    const toast = document.createElement('div');
    toast.textContent = message;
    
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      info: '#3b82f6',
      warning: '#f59e0b'
    };
    
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: ${colors[type]};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 100002;
      animation: slideInRight 0.3s ease;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      max-width: 300px;
    `;
    
    // Agregar estilos de animación si no existen
    if (!document.getElementById('toast-animations')) {
      const style = document.createElement('style');
      style.id = 'toast-animations';
      style.textContent = `
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100px);
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  
  /**
   * Muestra un diálogo de confirmación nativo
   * (En producción, reemplazar con un modal personalizado)
   */
  confirm(message: string): boolean {
    return confirm(message);
  }
  
  /**
   * Muestra una alerta nativa
   * (En producción, reemplazar con un modal personalizado)
   */
  alert(message: string): void {
    alert(message);
  }
}
