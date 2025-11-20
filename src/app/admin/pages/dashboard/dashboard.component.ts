import { Component } from '@angular/core';
import { ListingService } from '../../../services/listing.service';
import { firstValueFrom } from 'rxjs';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: false
})
export class DashboardComponent {
  categories: string[] = [];
  counts: Record<string, number> = {};

  constructor(private listingService: ListingService) {
    this.categories = this.listingService.categories();
    this.loadCounts();
  }

  async loadCounts() {
    for (const c of this.categories) {
      try {
        const res = await firstValueFrom(this.listingService.search(undefined, c, undefined, false, 0, 1));
        this.counts[c] = res.total;
      } catch {
        this.counts[c] = 0;
      }
    }
  }
}

