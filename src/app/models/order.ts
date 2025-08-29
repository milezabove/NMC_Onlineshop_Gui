import { Article } from './article';

export type OrderedArticle = Article & {
  quantity: number;
  priceAtPurchase?: number;
  lineTotal: number;
};

export interface Order {
  id: number;
  orderDate: string;
  orderStatus: string;
  items: OrderedArticle[];
  total: number;
}

