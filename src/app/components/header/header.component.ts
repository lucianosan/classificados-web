import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ListingService } from '../../services/listing.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: false
})
export class HeaderComponent {
  query = '';
  categories: string[] = [];
  constructor(private router: Router, protected auth: AuthService, private listingService: ListingService) {
    this.categories = this.listingService.categories();
  }
  onSearch() { this.router.navigate(['/'], { queryParams: { q: this.query || undefined } }); }
  goNew() { this.router.navigate(['/anunciar']); }
  goFav() { this.router.navigate(['/favoritos']); }
  goLogin() { this.router.navigate(['/login']); }
  goHome(event?: Event) { if (event) event.preventDefault(); this.router.navigateByUrl('/'); }
  toSlug(c: string): string { return c.toLowerCase().normalize('NFD').replace(/\p{Diacritic}+/gu,'').replace(/\s+/g,'-'); }
}
