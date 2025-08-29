import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Article } from '../models/article';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/articles`;

  listAll(): Observable<Article[]> {
    return this.http.get<any>(this.base).pipe(
      map(res => Array.isArray(res) ? res : (res?.content ?? []))
    );
  }
}
