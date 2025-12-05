import { Component, signal, ViewChild } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { SlideBar } from './shared/components/slide-bar/slide-bar';
import { HeaderComponent } from './shared/components/Header/header.Component';
import { FloatingChatComponent } from './shared/components/floating-chat/floating-chat';
import { CartSidebar } from './shared/components/cart-sidebar/cart-sidebar';
import { OrderConfirmationModal } from './shared/components/order-confirmation-modal/order-confirmation-modal';
import { ConfirmationModalComponent } from './shared/components/confirmation-modal/confirmation-modal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SlideBar, HeaderComponent, FloatingChatComponent, CartSidebar, OrderConfirmationModal, ConfirmationModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Plataforma de Domicilios');
  
  @ViewChild(SlideBar) slideBar!: SlideBar;
  
  sidebarOpen = false;
  sidebarMobile = false;
  
  constructor(private router: Router) {}

  onSidebarStateChange(state: { isOpen: boolean; isMobile: boolean }): void {
    this.sidebarOpen = state.isOpen;
    this.sidebarMobile = state.isMobile;
  }

  toggleSidebar(): void {
    if (this.slideBar) {
      this.slideBar.toggle();
    }
  }

  goToHome(): void {
    this.router.navigate(['/restaurantes']);
    if (this.slideBar) {
      this.slideBar.setActiveSection('inicio');
    }
  }
}
