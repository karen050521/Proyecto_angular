import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SlideBar } from './shared/components/slide-bar/slide-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SlideBar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Plataforma de Domicilios');
  
  sidebarOpen = true;
  sidebarMobile = false;

  onSidebarStateChange(state: { isOpen: boolean; isMobile: boolean }): void {
    this.sidebarOpen = state.isOpen;
    this.sidebarMobile = state.isMobile;
  }
}
