import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../environments/environment';

export interface PurchaseItem { articleId: number; quantity: number; }
export interface PurchaseResponse {
  orderId: number; status: string; total: number;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/orders`;

  purchase(items: { articleId: number; quantity: number; }[]) {
    return this.http.post<PurchaseResponse>(`${this.base}/purchase`, items);
  }

}
