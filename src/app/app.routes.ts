import { Routes } from '@angular/router';
import {AuthPageComponent} from './pages/auth-page.component';
import {MarketComponent} from './pages/market.component';
import {authGuard} from './guards/auth.guard';
import {OrdersComponent} from './pages/orders.component';

export const routes: Routes = [
  { path: '', component: AuthPageComponent },
  { path: 'shop', component: MarketComponent, canActivate: [authGuard] },
  {path: 'orders', component: OrdersComponent, canActivate: [authGuard]},
  { path: '**', redirectTo: '' }
];
