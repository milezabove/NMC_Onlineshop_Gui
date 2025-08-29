import { Routes } from '@angular/router';
import {AuthPageComponent} from './pages/auth-page.component';
import {MarketComponent} from './pages/market.component';
import {authGuard} from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: AuthPageComponent },
  { path: 'shop', component: MarketComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
