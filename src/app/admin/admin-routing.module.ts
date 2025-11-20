import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ListingsComponent } from './pages/listings/listings.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'anuncios', component: ListingsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}

