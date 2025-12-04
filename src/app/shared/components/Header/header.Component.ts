  import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserAvatarComponent } from './user.Avatar.Component';
import { CartIconComponent } from '../cart-icon/cart-icon';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.Component.html',
  styleUrls: ['./header.Component.css'],
  imports: [
    CommonModule,
    UserAvatarComponent,
    RouterModule,
    CartIconComponent
  ]
})

export class HeaderComponent {
  @Input() isMobile: boolean = false;
  @Input() sidebarOpen: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() goToHome = new EventEmitter<void>();

  photoURL = localStorage.getItem('photoURL') || '';
  showProfileMenu = false;

  constructor(private router: Router) {}

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  goHome() {
    // Emit event to parent to activate "inicio" section
    this.goToHome.emit();
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  logout() {
    // Implement logout logic here
    console.log('Logout clicked');
    this.showProfileMenu = false;
    // TODO: Add actual logout logic (clear tokens, redirect, etc.)
  }
}