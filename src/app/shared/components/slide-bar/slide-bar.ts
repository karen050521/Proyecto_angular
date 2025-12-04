import { Component, HostListener, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-slide-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './slide-bar.html',
  styleUrl: './slide-bar.css',
})
export class SlideBar implements OnInit {
    clientLinks = [
      { to: '/dashboard/client/orders', label: 'Pedidos' },
      { to: '/dashboard/client/cart', label: 'Carrito' },
      { to: '/dashboard/client/profile', label: 'Perfil' },
    ];
  isOpen = false; // Cerrado por defecto
  isMobile = false;
  private wasMobile = false;
  activeSection = 'inicio'; // Sección activa por defecto
  adminExpanded = false; // Estado del menú Admin

  @Output() sidebarStateChange = new EventEmitter<{ isOpen: boolean; isMobile: boolean }>();

  constructor(public themeService: ThemeService, private router: Router) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.wasMobile = this.isMobile;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const currentIsMobile = window.innerWidth < 768;
    
    // Solo cambiar el estado si realmente cambió el modo (mobile <-> desktop)
    if (currentIsMobile !== this.wasMobile) {
      this.isMobile = currentIsMobile;
      
      // Cerrado por defecto en ambos modos
      this.isOpen = false;
      
      this.wasMobile = this.isMobile;
      this.emitState();
    } else {
      // Solo actualizar la variable sin cambiar isOpen
      this.isMobile = currentIsMobile;
    }
  }

  toggle(): void {
    console.log('Toggle clicked - Before:', { isOpen: this.isOpen, isMobile: this.isMobile });
    this.isOpen = !this.isOpen;
    console.log('Toggle clicked - After:', { isOpen: this.isOpen, isMobile: this.isMobile });
    this.emitState();
  }

  close(): void {
    // Always close the sidebar when this is called (overlay click, menu selection)
    console.log('Close clicked (force):', { isOpen: this.isOpen, isMobile: this.isMobile });
    if (this.isOpen) {
      this.isOpen = false;
      this.emitState();
    }
  }

  setActiveSection(section: string): void {
      this.activeSection = section;
      // Evitar navegación al hacer click en 'Clientes', solo togglear sub-links
      if (section !== 'clientes') {
        this.close();
      }
  }

  toggleAdmin(): void {
    this.adminExpanded = !this.adminExpanded;
  }

  private emitState(): void {
    this.sidebarStateChange.emit({ isOpen: this.isOpen, isMobile: this.isMobile });
  }
}
