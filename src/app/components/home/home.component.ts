import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { Listing } from '../../models/listing';
import { combineLatest } from 'rxjs';

@Component({
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false
})
export class HomeComponent implements OnInit {
  listings: Listing[] = [];
  categories: string[] = [];
  q = '';
  category = '';
  city = '';
  favoritesOnly = false;
  loading = false;
  total = 0;
  page = 0;
  size = 12;
  sizes: number[] = [12, 24, 48];
  goto = 1;
  get totalPages() { return Math.max(1, Math.ceil(this.total / this.size)); }

  constructor(private listingService: ListingService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.categories = this.listingService.categories();
    combineLatest([this.route.paramMap, this.route.queryParamMap, this.route.data]).subscribe(([p, q, d]) => {
      const s = p.get('slug');
      if (s) {
        const m = this.categories.find(c => this.toSlug(c) === s);
        this.category = m || '';
        this.page = 0;
      } else {
        this.category = '';
      }
      this.q = q.get('q') || '';
      this.favoritesOnly = !!d['favoritesOnly'];
      this.refresh();
    });
  }

  refresh() {
    this.loading = true;
    this.listingService.search(this.q, this.category || undefined, this.city || undefined, this.favoritesOnly, this.page, this.size)
      .subscribe({
        next: res => { this.listings = res.items; this.total = res.total; this.loading = false; },
        error: _ => { this.loading = false; }
      });
  }

  applyFilters() { this.page = 0; this.refresh(); }
  view(l: Listing) { this.router.navigate(['/item', l.id], { state: { listing: l } }); }
  toggleFav(id: string) { this.listingService.toggleFavorite(id); this.refresh(); }
  isFav(id: string): boolean { return this.listingService.isFavorite(id); }
  prevPage() { if (this.page > 0) { this.page--; this.refresh(); } }
  nextPage() { if (this.page + 1 < this.totalPages) { this.page++; this.refresh(); } }
  goToPage(p: number) { if (p >= 0 && p < this.totalPages) { this.page = p; this.refresh(); } }
  setSize(s: number) { this.size = s; this.page = 0; this.refresh(); }
  goToPageInput() { const p = (this.goto || 1) - 1; if (p >= 0 && p < this.totalPages) { this.page = p; this.refresh(); } }
  toSlug(c: string): string { return c.toLowerCase().normalize('NFD').replace(/\p{Diacritic}+/gu,'').replace(/\s+/g,'-'); }
}
