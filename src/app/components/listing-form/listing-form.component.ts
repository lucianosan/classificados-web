import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ListingService } from '../../services/listing.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  templateUrl: './listing-form.component.html',
  styleUrl: './listing-form.component.scss',
  standalone: false
})
export class ListingFormComponent {
  categories: string[] = [];
  images: string[] = [];
  states: { id: number; sigla: string; nome: string }[] = [];
  cities: { id: number; nome: string }[] = [];
  form!: ReturnType<FormBuilder['group']>;

  constructor(private fb: FormBuilder, private listingService: ListingService, private auth: AuthService, private router: Router) {
    this.categories = this.listingService.categories();
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      contactPhone: ['']
    });

    this.listingService.getStates().subscribe(s => { this.states = s; });
    this.form.get('state')!.valueChanges.subscribe(sigla => {
      const st = this.states.find(x => x.sigla === sigla);
      this.cities = [];
      this.form.get('city')!.setValue('');
      if (st) {
        this.listingService.getCitiesByStateId(st.id).subscribe(cs => { this.cities = cs; });
      }
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;
    const user = await firstValueFrom(this.auth.currentUser$);
    if (!user) return;
    const listing = await firstValueFrom(this.listingService.create({ ...this.form.value, images: this.images, ownerId: user.id } as any));
    this.router.navigate(['/item', listing.id]);
  }

  async onFilesSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || !files.length) return;
    const promises = Array.from(files).map(f => this.readFileAsDataURL(f));
    const urls = await Promise.all(promises);
    this.images = [...this.images, ...urls];
  }

  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error as any);
      reader.readAsDataURL(file);
    });
  }

  removeImage(i: number) { this.images.splice(i, 1); }
}
