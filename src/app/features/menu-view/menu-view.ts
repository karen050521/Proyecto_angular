
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../core/services/menu.service';
import { Menu } from '../../core/models/menu.model';

@Component({
  selector: 'app-menu-view',
  imports: [CommonModule],
  templateUrl: './menu-view.html',
  styleUrl: './menu-view.css',
})
export class MenuView implements OnInit {
  private menuService = inject(MenuService);

  menus: Menu[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.loadMenus();
  }

  loadMenus(): void {
    this.loading = true;
    this.menuService.getAll().subscribe({
      next: (data) => {
        this.menus = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar menús';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
