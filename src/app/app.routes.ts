import { Routes } from '@angular/router';
import { ClientLayoutComponent } from './core/layouts/client-layout.component';
import { CartViewComponent } from './features/cart-view/cart-view';
import { MenuView } from './features/menu-view/menu-view';
import { RestaurantManagente } from './features/restaurant-managente/restaurant-managente';
import { RestaurantsView } from './features/restaurants-view/restaurants-view';
import { DashboardComponent } from './features/dashboard/dashboard';
import { OrdersView } from './features/orders-view/orders-view';
import { DriversListComponent } from './features/admin/drivers/drivers';
import { AddressesListComponent } from './features/admin/addresses/addresses';
import { OrderTrackingComponent } from './features/order-tracking/order-tracking';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'restaurantes',
		pathMatch: 'full'
	},
	{
		path: 'dashboard',
		component: DashboardComponent
	},
	{
		path: 'dashboard/client',
		component: ClientLayoutComponent,
		children: [
			{ path: 'orders', component: OrdersView },
			{ path: 'cart', component: CartViewComponent }
		]
	},
	{
		path: 'admin/manage',
		component: RestaurantManagente
	},
	{
		path: 'admin/drivers',
		component: DriversListComponent
	},
	{
		path: 'admin/addresses',
		component: AddressesListComponent
	},
	
	{
		path: 'tracking/:id',
		component: OrderTrackingComponent
	},
	{
		path: 'orders',
		component: OrdersView
	},
	{
		path: 'restaurantes',
		component: RestaurantsView
	},
	{
		path: 'restaurantes/:id/menu',
		component: MenuView
	},
	{
		path: 'cart',
		component: CartViewComponent
	}
];
