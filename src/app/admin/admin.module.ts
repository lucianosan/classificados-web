import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ListingsComponent } from './pages/listings/listings.component';

@NgModule({
  declarations: [DashboardComponent, ListingsComponent],
  imports: [CommonModule, FormsModule, AdminRoutingModule]
})
export class AdminModule {}

