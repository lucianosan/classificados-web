import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of, throwError } from 'rxjs';
import { Listing } from '../models/listing';
import { apiBase } from '../env';

@Injectable({ providedIn: 'root' })
export class ListingService {
  private api = apiBase();
  private favKey = 'favorites';

  constructor(private http: HttpClient) {}

  search(query?: string, category?: string, city?: string, favoritesOnly: boolean = false, page: number = 0, size: number = 12): Observable<{ items: Listing[]; total: number; }> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (query) params = params.set('q', query);
    if (category) params = params.set('category', category);
    if (city) params = params.set('city', city);
    if (favoritesOnly) params = params.set('favoritesOnly', 'true');
    return this.http.get<any>(`${this.api}/listings`, { params }).pipe(
      map(res => {
        const rawItems = Array.isArray(res)
          ? res
          : (Array.isArray(res.items) ? res.items : (Array.isArray(res.content) ? res.content : []));
        const items = (rawItems as any[]).map((it: any) => this.normalizeListing(it));
        const total = Array.isArray(res)
          ? items.length
          : Number(res.total ?? res.count ?? items.length);
        return { items, total };
      }),
      catchError(() => of({ items: [], total: 0 }))
    );
  }

  getById(id: string): Observable<Listing> {
    const byPath$ = this.http.get<any>(`${this.api}/listings/${encodeURIComponent(id)}`).pipe(map(r => this.normalizeListing(r)));
    const byQuery$ = this.http.get<any>(`${this.api}/listings`, { params: new HttpParams().set('id', id) }).pipe(map(r => this.normalizeListing(r)));
    const altQuery$ = this.http.get<any>(`${this.api}/listing`, { params: new HttpParams().set('id', id) }).pipe(map(r => this.normalizeListing(r)));
    const bySlug$ = this.search(id, undefined, undefined, false, 0, 1).pipe(
      map(res => {
        const m = res.items.find(it => this.toSlug(it.title) === id);
        if (!m) throw new Error('Anúncio não encontrado');
        return m;
      })
    );
    return byPath$.pipe(
      catchError(() => byQuery$.pipe(
        catchError(() => altQuery$.pipe(
          catchError(() => bySlug$.pipe(
            catchError(() => throwError(() => new Error('Anúncio não encontrado')))
          ))
        ))
      ))
    );
  }

  create(payload: Partial<Listing>): Observable<Listing> {
    return this.http.post<Listing>(`${this.api}/listings`, payload).pipe(
      catchError(() => throwError(() => new Error('Falha ao criar anúncio')))
    );
  }

  incrementViews(id: string): Observable<void> {
    return this.http.post<void>(`${this.api}/listings/${id}/views`, {}).pipe(
      catchError(() => of(void 0))
    );
  }

  private normalizeListing(res: any): Listing {
    const item = Array.isArray(res) ? (res[0] || {}) : res || {};
    const images = Array.isArray(item.images)
      ? item.images
      : (typeof item.images === 'string' ? (item.images as string).split(',').map(s => s.trim()).filter(Boolean) : []);
    return {
      id: item.publicId ?? item.public_id ?? item.id ?? item.uuid ?? item._id ?? '',
      title: item.title ?? item.titulo ?? '',
      description: item.description ?? item.descricao ?? '',
      price: Number(item.price ?? item.preco ?? 0),
      category: item.category ?? item.categoria ?? '',
      images,
      city: item.city ?? item.cidade ?? '',
      state: item.state ?? item.estado ?? '',
      ownerId: item.ownerId ?? item.owner_id ?? '',
      contactPhone: item.contactPhone ?? item.contact_phone ?? undefined,
      contactEmail: item.contactEmail ?? item.contact_email ?? undefined,
      createdAt: Number(item.createdAt ?? item.created_at ?? Date.now()),
      views: Number(item.views ?? 0),
      isActive: Boolean(item.isActive ?? item.ativo ?? true)
    } as Listing;
  }

  private toSlug(c: string): string {
    return (c || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}+/gu, '').replace(/\s+/g, '-');
  }

  getStates(): Observable<{ id: number; sigla: string; nome: string }[]> {
    return this.http
      .get<any[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome`)
      .pipe(
        map(arr => arr.map(s => ({ id: s.id, sigla: s.sigla, nome: s.nome }))),
        catchError(() => of([]))
      );
  }

  getCitiesByStateId(ufId: number): Observable<{ id: number; nome: string }[]> {
    return this.http
      .get<any[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufId}/municipios?orderBy=nome`)
      .pipe(
        map(arr => arr.map(c => ({ id: c.id, nome: c.nome }))),
        catchError(() => of([]))
      );
  }

  toggleFavorite(id: string) {
    const raw = localStorage.getItem(this.favKey);
    const favs = raw ? JSON.parse(raw) as string[] : [];
    const i = favs.indexOf(id);
    if (i >= 0) favs.splice(i, 1); else favs.push(id);
    localStorage.setItem(this.favKey, JSON.stringify(favs));
  }

  isFavorite(id: string): boolean {
    const raw = localStorage.getItem(this.favKey);
    const favs = raw ? JSON.parse(raw) as string[] : [];
    return favs.includes(id);
  }

  categories(): string[] {
    return ['Imóveis', 'Autos', 'Eletrônicos', 'Móveis', 'Esportes', 'Moda', 'Serviços', 'Pets', 'Outros'];
  }
}
