import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {OrdersService} from '../services/orders.service';
import {Order} from '../models/order';

@Component({
  standalone: true,
  selector: 'app-orders-page',
  imports: [CommonModule, RouterModule],
  template: `
    <header class="topbar">
      <h1 class="brand">Meine Bestellungen</h1>
      <div class="spacer"></div>
      <a class="link" routerLink="/shop">Zurück zum Shop</a>
    </header>

    <main class="content">
      <ng-container *ngIf="orders(); else loading">
        <section *ngIf="orders()!.length === 0" class="empty">
          Noch keine Bestellungen.
        </section>

        <section class="list" *ngIf="orders()!.length > 0">
          <article class="order" *ngFor="let o of orders(); trackBy: trackByOrderId">
            <header class="o-head">
              <div>
                <div class="muted">Bestellung #{{ o.id }}</div>
                <div class="date">{{ o.orderDate | date:'dd.MM.yyyy, HH:mm' }}</div>
              </div>
              <div class="right">
                <span class="badge"
                      [class.badge-blue]="o.orderStatus === 'Bestätigt'"
                      [class.badge-yellow]="o.orderStatus === 'Versendet'"
                      [class.badge-green]="o.orderStatus === 'Abgeschlossen'">
                  {{ o.orderStatus || 'Bestätigt' }}
                </span>
                <strong class="total">{{ o.total | number:'1.2-2' }} CHF</strong>
              </div>
            </header>

            <ul class="items">
              <li *ngFor="let it of o.items; let i = index">
                <img [src]="it.imageUrl || '/assets/placeholder.png'" [alt]="it.name">
                <div class="grow">
                  <div class="name">{{ it.name }}</div>
                  <div class="muted">
                    {{ (it.priceAtPurchase ?? it.price) | number:'1.2-2' }} CHF / Stk
                  </div>
                </div>
                <div class="qty">×{{ it.quantity }}</div>
                <div class="line">{{ it.lineTotal | number:'1.2-2' }} CHF</div>
              </li>
            </ul>
          </article>
        </section>
      </ng-container>

      <ng-template #loading>
        <div class="loading">Lade…</div>
      </ng-template>
    </main>
  `,
  styles: [`
    .topbar {
      position: sticky;
      top: 0;
      z-index: 5;
      display: flex;
      align-items: center;
      gap: .75rem;
      padding: .75rem 1rem;
      border-bottom: 1px solid var(--accent);
    }

    .brand { font-size: 1.4rem }
    .spacer { flex: 1 }
    .link { text-decoration: underline; cursor: pointer; color: var(--muted) }

    .content { padding: 1rem; background: var(--bg); min-height: calc(100dvh - 56px); }
    .empty { color: var(--muted); text-align: center; margin-top: 2rem; }

    .list { display: grid; gap: 1rem; }
    .order { background: var(--card); border: 1px solid var(--accent); border-radius: 14px; box-shadow: var(--shadow); overflow: hidden; }
    .o-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .8rem 1rem; border-bottom: 1px solid var(--accent); }
    .muted { color: var(--muted); font-size: .9rem }
    .date { font-weight: 600; }
    .right { display: flex; align-items: center; gap: .75rem }
    .badge {
      padding: .1rem .5rem; border-radius: 999px;
      background: var(--accent-2); border: 1px solid #cfe3d1; color: var(--ink);
    }

    .badge.badge-blue   { background: #e0f2fe; border-color: #bae6fd; color: #075985; } /* Bestätigt */
    .badge.badge-yellow { background: #fef9c3; border-color: #fde68a; color: #854d0e; } /* Versendet */
    .badge.badge-green  { background: #dcfce7; border-color: #bbf7d0; color: #166534; } /* Abgeschlossen */

    .total { font-size: 1.05rem }

    .items { list-style: none; margin: 0; padding: 0 }
    .items li { display: flex; align-items: center; gap: .75rem; padding: .6rem 1rem; border-top: 1px dashed var(--accent) }
    .items img { width: 48px; height: 48px; object-fit: contain; border: 1px dashed var(--accent); border-radius: 8px; background: #fff }
    .grow { flex: 1 }
    .name { font-weight: 600 }
    .qty { min-width: 40px; text-align: right }
    .line { min-width: 96px; text-align: right; font-weight: 600 }

    .loading { color: var(--muted); text-align: center; padding: 2rem 0 }
  `]
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrdersService);
  orders = signal<Order[] | null>(null);

  ngOnInit() {
    this.orderService.getOrders().subscribe(list => this.orders.set(list));
  }

  trackByOrderId = (_: number, x: Order) => x.id;
}
