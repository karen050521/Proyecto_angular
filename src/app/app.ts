import { Component, signal, ViewChild } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { SlideBar } from './shared/components/slide-bar/slide-bar';
import { HeaderComponent } from './shared/components/Header/header.Component';
import { FloatingChatComponent } from './shared/components/floating-chat/floating-chat';
import { MapConsumerComponent } from './shared/components/map-consumer/map-consumer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SlideBar, HeaderComponent, FloatingChatComponent, MapConsumerComponent, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Plataforma de Domicilios');
  
  @ViewChild(SlideBar) slideBar!: SlideBar;
  
  sidebarOpen = false; // Cerrado por defecto
  sidebarMobile = false;

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
    // Activate the "inicio" section in the sidebar
    if (this.slideBar) {
      this.slideBar.setActiveSection('inicio');
    }
  }
}
