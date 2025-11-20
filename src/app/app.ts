import { Component, signal } from '@angular/core';
import { ListingService } from './services/listing.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('classificados-web');
  categories: string[] = [];
  categoryCounts: Record<string, number> = {};

  constructor(private listingService: ListingService) {
    this.categories = this.listingService.categories();
    this.loadCategoryCounts();
  }

  async loadCategoryCounts() {
    for (const c of this.categories) {
      try {
        const res = await firstValueFrom(this.listingService.search(undefined, c, undefined, false, 0, 1));
        this.categoryCounts[c] = res.total;
      } catch {
        this.categoryCounts[c] = 0;
      }
    }
  }

  toSlug(c: string): string {
    return c.toLowerCase().normalize('NFD').replace(/\p{Diacritic}+/gu, '').replace(/\s+/g, '-');
  }
}
