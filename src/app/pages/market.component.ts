import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ArticleService} from '../services/article.service';
import {BasketService} from '../services/basket.service';
import {OrdersService, PurchaseResponse} from '../services/orders.service';
import {Article} from '../models/article';
import {Router, RouterModule} from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-market-page',
  imports: [CommonModule, RouterModule],
  template: `
    <header class="topbar">
      <h1 class="brand">Marktplatz</h1>

      <div class="spacer"></div>

      <button class="basket-btn" (click)="showBasket.set(true)" aria-label="Warenkorb öffnen">
        <img src="assets/images/korb.png" alt="Warenkorb">
        <span *ngIf="basket.totalQty() > 0" class="basket-badge">{{ basket.totalQty() }}</span>
      </button>

      <div class="menu-wrap">
        <button
          class="menu-btn"
          (click)="toggleMenu()"
          [attr.aria-expanded]="menuOpen()"
          aria-haspopup="menu"
          aria-label="Menü öffnen">
          <span></span><span></span><span></span>
        </button>


        <div class="menu" *ngIf="menuOpen()" role="menu">
          <a role="menuitem" (click)="goToOrders()">Meine Bestellungen</a>
          <button role="menuitem" (click)="logout()">Logout</button>
        </div>
      </div>
    </header>
    <main class="content">
      <section class="grid">
        <article class="card" *ngFor="let a of articles(); trackBy: trackById">
          <div class="img">
            <img [src]="a.imageUrl || ''" [alt]="a.name">
            <span class="badge" *ngIf="basket.qtyById(a.id) > 0">×{{ basket.qtyById(a.id) }}</span>
          </div>
          <h3>{{ a.name }}</h3>
          <p class="desc">{{ a.description }}</p>
          <div class="row">
            <span class="tag" *ngIf="a.category">{{ a.category }}</span>
            <strong>{{ a.price | number:'1.2-2' }} CHF</strong>
          </div>
          <ng-container *ngIf="basket.qtyById(a.id) === 0; else qtyCtrls">
            <button class="btn" (click)="basket.add(a)">In den Korb</button>
          </ng-container>
          <ng-template #qtyCtrls>
            <div class="qty">
              <button (click)="basket.dec(a.id)">−</button>
              <span>{{ basket.qtyById(a.id) }}</span>
              <button (click)="basket.inc(a.id)">＋</button>
            </div>
          </ng-template>
        </article>
      </section>
    </main>
    <aside class="drawer" [class.open]="showBasket()">
      <header class="drawer-top">
        <h2>Warenkorb ({{ basket.totalQty() }})</h2>
      </header>
      <ul class="basket-list">
        <li class="rowline" *ngFor="let ci of basket.items(); trackBy: trackById">
          <img class="thumb" [src]="ci.article.imageUrl || '/assets/placeholder.png'" [alt]="ci.article.name">
          <div class="grow">
            <div class="name">{{ ci.article.name }}</div>
            <div class="price">{{ ci.article.price | number:'1.2-2' }} CHF / Stk</div>
            <div class="qty-controls">
              <button (click)="basket.dec(ci.article.id)">−</button>
              <span>{{ ci.qty }}</span>
              <button (click)="basket.inc(ci.article.id)">＋</button>
              <button class="remove" (click)="basket.remove(ci.article.id)">Entfernen</button>
            </div>
          </div>
          <div class="line-total">{{ (ci.article.price * ci.qty) | number:'1.2-2' }} CHF</div>
        </li>
      </ul>
      <footer class="drawer-bottom">
        <div><strong>{{ basket.totalPrice() | number:'1.2-2' }} CHF</strong></div>
        <div class="space"></div>
        <button class="ghost" (click)="basket.clear()" [disabled]="basket.totalQty()===0 || busy()">Leeren</button>
        <button class="primary" (click)="purchase()" [disabled]="basket.totalQty()===0 || busy()">
          {{ busy() ? 'Wird ausgeführt…' : 'Kauf abschliessen' }}
        </button>
      </footer>
    </aside>
    <div class="backdrop" *ngIf="showBasket()" (click)="showBasket.set(false)"></div>
    <div *ngIf="confirm()" class="confirm">
      Bestellung #{{ confirm()!.orderId }} bestätigt. Summe: {{ confirm()!.total | number:'1.2-2' }} CHF
    </div>
  `,
  styles: [`
    .topbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: .75rem;
      padding: .75rem 1rem;
      border-bottom: 1px solid var(--accent);
      background: linear-gradient(180deg, #fff, var(--bg));
      backdrop-filter: blur(4px);
    }

    .brand {
      font-size: 1.5rem;
      letter-spacing: .3px
    }

    .spacer {
      flex: 1
    }

    .basket-btn {
      position: relative;
      margin-right: .25rem;
      width: 42px;
      height: 42px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      border: 1px solid var(--accent);
      background: #fff;
      box-shadow: var(--shadow);
      cursor: pointer;
    }

    .basket-btn img {
      width: 24px;
      height: 24px;
      object-fit: contain
    }

    .basket-badge {
      position: absolute;
      right: -6px;
      top: -6px;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      font-size: .75rem;
      font-weight: 600;
      background: var(--accent-2);
      color: var(--ink);
      border: 1px solid #cfe3d1;
    }

    .content {
      padding: 1rem
    }

    .grid {
      display: grid;
      gap: 1rem;
      grid-template-columns:repeat(auto-fill, minmax(220px, 1fr))
    }

    .card {
      border: 1px solid var(--accent);
      border-radius: 14px;
      padding: .9rem;
      display: flex;
      flex-direction: column;
      gap: .55rem;
      background: var(--card);
      box-shadow: var(--shadow);
    }

    .img {
      position: relative;
      aspect-ratio: 1/1;
      background: #fff;
      border: 1px dashed var(--accent);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .img img {
      width: 100%;
      height: 100%;
      object-fit: contain
    }

    .badge {
      position: absolute;
      top: .5rem;
      right: .5rem;
      background: var(--accent);
      color: var(--ink);
      border-radius: 999px;
      padding: .1rem .5rem;
      font-size: .8rem;
      border: 1px solid var(--ring);
    }

    .desc {
      color: var(--muted);
      font-size: .92rem;
      margin: 0
    }

    .row {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: .75rem;
    }

    .row .tag {
      font-size: .8rem;
      background: var(--accent-2);
      border: 1px solid #cfe3d1;
      border-radius: 999px;
      padding: .1rem .5rem;
      flex: 0 1 auto;
    }

    .row strong {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    .btn {
      border: 1px solid var(--accent);
      background: #fff;
      color: var(--ink);
      padding: .5rem;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: var(--shadow);
    }

    .btn:hover {
      background: #fff7fb
    }

    .qty {
      display: flex;
      align-items: center;
      gap: .5rem;
      margin-top: .5rem;
    }

    .qty button {
      border: 1px solid var(--accent);
      background: #fff;
      padding: .3rem .55rem;
      border-radius: 6px;
      cursor: pointer;
    }

    .drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 360px;
      background: #fff;
      border-left: 1px solid var(--accent);
      transform: translateX(100%);
      transition: transform .2s ease;
      display: flex;
      flex-direction: column;
      z-index: 40;
      box-shadow: var(--shadow);
    }

    .drawer.open {
      transform: translateX(0)
    }

    .drawer-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid var(--accent)
    }

    .basket-list {
      list-style: none;
      margin: 0;
      padding: 0;
      overflow: auto;
      flex: 1
    }

    .rowline {
      display: flex;
      gap: .75rem;
      align-items: center;
      padding: .75rem;
      border-bottom: 1px dashed var(--accent)
    }

    .thumb {
      width: 56px;
      height: 56px;
      object-fit: contain;
      background: #fff;
      border: 1px dashed var(--accent);
      border-radius: 8px
    }

    .grow {
      flex: 1
    }

    .name {
      font-weight: 600
    }

    .price {
      font-size: .9rem;
      color: var(--muted)
    }

    .qty-controls {
      display: flex;
      align-items: center;
      gap: .5rem;
      margin-top: .25rem
    }

    .qty-controls button {
      border: 1px solid var(--accent);
      background: #fff;
      padding: .3rem .55rem;
      border-radius: 6px;
      cursor: pointer
    }

    .qty-controls .remove {
      border: none;
      background: none;
      color: #a14b4b;
      cursor: pointer
    }

    .line-total {
      min-width: 88px;
      text-align: right;
      font-weight: 600
    }

    .drawer-bottom {
      display: flex;
      align-items: center;
      gap: .5rem;
      padding: 1rem;
      border-top: 1px solid var(--accent)
    }

    .drawer-bottom .space {
      flex: 1
    }

    .drawer-bottom .primary {
      background: var(--accent-2);
      color: var(--ink);
      border: 1px solid #cfe3d1;
      padding: .5rem .75rem;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: var(--shadow);
    }

    .drawer-bottom .ghost {
      background: var(--accent);
      border: 1px solid var(--accent);
      padding: .5rem .75rem;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: var(--accent);
      color: var(--muted);
    }

    .drawer-bottom button:disabled {
      opacity: .6;
      cursor: not-allowed;
      box-shadow: none;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, .18);
      z-index: 30
    }

    .confirm {
      position: fixed;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: .6rem .9rem;
      border-radius: 10px;
      z-index: 50;
      box-shadow: var(--shadow);
    }

    .menu-wrap {
      position: relative;
      margin-left: .4rem;
    }

    .menu-btn {
      width: 42px;
      height: 42px;
      border-radius: 999px;
      border: 1px solid var(--accent);
      background: #fff;
      box-shadow: var(--shadow);
      display: grid;
      place-items: center;
      cursor: pointer;
    }

    .menu-btn span {
      display: block;
      width: 18px;
      height: 4px;
      background: var(--ring);
      margin: 2px 2px;
      border-radius: 2px;
    }

    .menu {
      position: absolute;
      right: 0;
      top: 48px;
      min-width: 220px;
      z-index: 60;
      background: #fff;
      border: 1px solid var(--accent);
      border-radius: 12px;
      box-shadow: var(--shadow);
      padding: .35rem;
      display: flex;
      flex-direction: column;
      gap: .25rem;
    }

    .menu a, .menu button {
      text-align: left;
      width: 100%;
      padding: .55rem .6rem;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      color: var(--ink);
      text-decoration: none;
      font: inherit;
    }

    .menu a:hover, .menu button:hover {
      background: #fff7fb
    }
  `]
})
export class MarketComponent implements OnInit {
  private api = inject(ArticleService);
  basket = inject(BasketService);
  private orders = inject(OrdersService);
  private router = inject(Router);

  articles = signal<Article[]>([]);
  showBasket = signal(false);
  busy = signal(false);
  menuOpen = signal(false);
  confirm = signal<PurchaseResponse | null>(null);

  ngOnInit() {
    this.api.listAll().subscribe(list => this.articles.set(list));
  }

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  goToOrders() {
    this.menuOpen.set(false);
    this.router.navigateByUrl('/orders');
  }


  purchase() {
    if (this.basket.totalQty() === 0 || this.busy()) return;
    this.busy.set(true);
    const items = this.basket.items().map(i => ({articleId: i.article.id, quantity: i.qty}));
    this.orders.purchase(items).subscribe({
      next: (resp) => {
        this.confirm.set(resp);
        this.basket.clear();
        this.showBasket.set(false);
        this.busy.set(false);
        setTimeout(() => this.confirm.set(null), 3000);
      },
      error: (e) => {
        this.busy.set(false);
        if (e?.status === 401) this.router.navigateByUrl('/');
        else alert('Kauf fehlgeschlagen.');
      }
    });
  }

  logout() {
    this.menuOpen.set(false)
    localStorage.removeItem('jwt');
    this.router.navigateByUrl('/');
  }

  trackById = (_: number, x: any) => (x.id ?? x.article?.id);
}
