import { Routes } from '@angular/router';
import { ClientLayoutComponent } from './core/layouts/client-layout.component';
import { CartViewComponent } from './features/cart-view/cart-view';
import { MenuView } from './features/menu-view/menu-view';
import { RestaurantManagente } from './features/restaurant-managente/restaurant-managente';
import { RestaurantsView } from './features/restaurants-view/restaurants-view';
import { CartComponent } from './shared/components/Client/cart.component';
import { OrdersComponent } from './shared/components/Client/orders.component';
import { ProfileComponent } from './shared/components/Client/profile.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'restaurantes',
    pathMatch: 'full',
  },
  {
    path: 'dashboard/client',
    component: ClientLayoutComponent,
    children: [
      { path: 'orders', component: OrdersComponent },
      { path: 'cart', component: CartComponent },
      { path: 'profile', component: ProfileComponent },
    ],
  },
  {
    path: 'admin/manage',
    component: RestaurantManagente,
  },
  {
    path: 'restaurantes',
    component: RestaurantsView,
  },
  {
    path: 'restaurantes/:id/menu',
    component: MenuView,
  },
  {
    path: 'cart',
    component: CartViewComponent,
  },
];
