import { Injectable, signal } from '@angular/core';

export interface OrderNotification {
  id: string;
  orderId: number;
  driverName: string;
  orderDetails: string;
  timestamp: Date;
  read: boolean;
}

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
  private notifications = signal<OrderNotification[]>([]);
  private audio: HTMLAudioElement | null = null;

  constructor() {
    // Crear audio element con sonido de notificación
    this.audio = new Audio();
    // Sonido de notificación suave y profesional tipo "ding"
    // Frecuencia: 800Hz -> 1200Hz (ascendente, sonido agradable)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 0.15;
    const sampleRate = audioContext.sampleRate;
    const numSamples = duration * sampleRate;
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Generar tono con envelope (fade in/out) para sonido suave
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const freq = 800 + (400 * t / duration); // Sube de 800Hz a 1200Hz
      const envelope = Math.sin((Math.PI * i) / numSamples); // Fade in/out
      channelData[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3; // Volumen 30%
    }

    // Convertir buffer a base64 WAV
    const wavBuffer = this.audioBufferToWav(buffer);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    this.audio.src = URL.createObjectURL(blob);
    this.audio.volume = 0.4; // Volumen moderado
  }

  /**
   * Convierte AudioBuffer a formato WAV
   */
  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels); // avg. bytes/sec
    setUint16(buffer.numberOfChannels * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // Write interleaved data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return arrayBuffer;
  }

  getNotifications = () => this.notifications.asReadonly();
  getUnreadCount = () => this.notifications().filter(n => !n.read).length;

  /**
   * Agrega una notificación de pedido asignado
   */
  addOrderNotification(orderId: number, driverName: string, orderDetails: string): void {
    const notification: OrderNotification = {
      id: `${orderId}-${Date.now()}`,
      orderId,
      driverName,
      orderDetails,
      timestamp: new Date(),
      read: false
    };

    console.log('🔔 Agregando notificación:', notification);
    this.notifications.update(notifications => {
      const updated = [notification, ...notifications];
      console.log('📋 Total notificaciones:', updated.length);
      return updated;
    });
    
    this.playNotificationSound();
    this.showSuccess(`Pedido #${orderId} asignado a ${driverName}`);
  }

  /**
   * Marca una notificación como leída
   */
  markAsRead(notificationId: string): void {
    this.notifications.update(notifications =>
      notifications.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  markAllAsRead(): void {
    this.notifications.update(notifications =>
      notifications.map(n => ({ ...n, read: true }))
    );
  }

  /**
   * Elimina una notificación
   */
  removeNotification(notificationId: string): void {
    this.notifications.update(notifications =>
      notifications.filter(n => n.id !== notificationId)
    );
  }

  /**
   * Limpia todas las notificaciones
   */
  clearAll(): void {
    this.notifications.set([]);
  }

  /**
   * Reproduce el sonido de notificación
   */
  private playNotificationSound(): void {
    if (this.audio) {
      this.audio.currentTime = 0;
      this.audio.play().catch(error => {
        console.log('No se pudo reproducir el sonido de notificación:', error);
      });
    }
  }
  
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
