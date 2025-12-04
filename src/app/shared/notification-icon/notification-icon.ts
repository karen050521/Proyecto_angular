import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService, OrderNotification } from '../../core/services/notification.service';


@Component({
  selector: 'app-notification-icon',
  imports: [CommonModule],
  templateUrl: './notification-icon.html',
  styleUrl: './notification-icon.css',
})
export class NotificationIconComponent {
  showPanel = signal(false);
  unreadCount = signal(0);
  notifications: ReturnType<typeof this.notificationService.getNotifications>;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.notifications = this.notificationService.getNotifications();
    // Actualizar contador cuando cambien las notificaciones
    setInterval(() => {
      this.unreadCount.set(this.notificationService.getUnreadCount());
    }, 100);

    // Cerrar panel al hacer click fuera
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notification-container')) {
        this.showPanel.set(false);
      }
    });
  }

  togglePanel(): void {
    this.showPanel.update(v => !v);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  viewOrder(notification: OrderNotification): void {
    this.notificationService.markAsRead(notification.id);
    this.showPanel.set(false);
    this.router.navigate(['/tracking', notification.orderId]);
  }

  removeNotification(event: Event, notificationId: string): void {
    event.stopPropagation();
    this.notificationService.removeNotification(notificationId);
  }

  clearAll(): void {
    this.notificationService.clearAll();
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  }
}
