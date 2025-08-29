import { Injectable, signal, computed } from '@angular/core';
import { Article } from '../models/article';

export interface BasketItem { article: Article; qty: number; }

@Injectable({ providedIn: 'root' })
export class BasketService {

  items = signal<BasketItem[]>([]);

  totalQty = computed(() => this.items().reduce((n, i) => n + i.qty, 0));
  totalPrice = computed(() => this.items().reduce((s, i) => s + i.article.price * i.qty, 0));

  qtyById(id: number): number {
    return this.items().find(i => i.article.id === id)?.qty ?? 0;
  }

  add(a: Article) {
    const next = [...this.items()];
    const ix = next.findIndex(ci => ci.article.id === a.id);
    if (ix > -1) next[ix] = { ...next[ix], qty: next[ix].qty + 1 };
    else next.push({ article: a, qty: 1 });
    this.items.set(next);
  }

  inc(id: number) {
    this.items.set(this.items().map(i => i.article.id === id ? { ...i, qty: i.qty + 1 } : i));
  }

  dec(id: number) {
    this.items.set(
      this.items()
        .map(i => i.article.id === id ? { ...i, qty: i.qty - 1 } : i)
        .filter(i => i.qty > 0)
    );
  }

  remove(id: number) {
    this.items.set(this.items().filter(i => i.article.id !== id));
  }

  clear() { this.items.set([]); }
}
