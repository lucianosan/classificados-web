import { Component } from '@angular/core';
import { ListingService } from '../../../services/listing.service';
import { Listing } from '../../../models/listing';
import { Router } from '@angular/router';

@Component({
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.scss',
  standalone: false
})
export class ListingsComponent {
  items: Listing[] = [];
  total = 0;
  page = 0;
  size = 12;
  category = '';
  categories: string[] = [];

  constructor(private listingService: ListingService, private router: Router) {
    this.categories = this.listingService.categories();
    this.load();
  }

  load() {
    this.listingService.search(undefined, this.category || undefined, undefined, false, this.page, this.size)
      .subscribe(res => { this.items = res.items; this.total = res.total; });
  }

  view(id: string) { this.router.navigate(['/item', id]); }
}

