import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { Listing } from '../../models/listing';

@Component({
  templateUrl: './listing-detail.component.html',
  styleUrl: './listing-detail.component.scss',
  standalone: false
})
export class ListingDetailComponent implements OnInit {
  listing: Listing | null = null;
  selectedImage = 0;
  listingDetailError = '';

  constructor(private route: ActivatedRoute, private router: Router, private listingService: ListingService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    const st: any = history.state && (history.state as any).listing;
    if (st && st.id === id) {
      this.listing = st as Listing;
      this.listingService.incrementViews(this.listing.id).subscribe();
      return;
    }
    this.listingService.getById(id).subscribe({
      next: l => {
        this.listing = l;
        this.listingService.incrementViews(l.id).subscribe();
      },
      error: e => { this.listingDetailError = e?.message || 'Anúncio não encontrado'; }
    });
  }

  selectImage(i: number) { this.selectedImage = i; }
  toggleFav() { if (this.listing) this.listingService.toggleFavorite(this.listing.id); }
  isFav(): boolean { return this.listing ? this.listingService.isFavorite(this.listing.id) : false; }
}
