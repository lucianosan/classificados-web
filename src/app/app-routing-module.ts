import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ListingFormComponent } from './components/listing-form/listing-form.component';
import { ListingDetailComponent } from './components/listing-detail/listing-detail.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'categoria/:slug', component: HomeComponent },
  { path: 'anunciar', component: ListingFormComponent, canMatch: [AuthGuard] },
  { path: 'item/:id', component: ListingDetailComponent },
  { path: 'favoritos', component: HomeComponent, data: { favoritesOnly: true } },
  { path: 'login', component: LoginComponent },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule), canMatch: [AuthGuard], data: { roles: ['admin'] } },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
