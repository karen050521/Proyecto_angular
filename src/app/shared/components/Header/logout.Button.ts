import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout-button',
  template: `
    <button
      (click)="handleLogout()"
      class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-all"
    >
      Cerrar Sesión
    </button>
  `
})
export class LogoutButtonComponent {
  constructor(private router: Router) {}

  handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('photoURL');
    this.router.navigate(['/']);
  }
}