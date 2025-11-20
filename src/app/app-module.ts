import { NgModule, APP_INITIALIZER, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from './interceptors/api.interceptor';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { ListingFormComponent } from './components/listing-form/listing-form.component';
import { ListingDetailComponent } from './components/listing-detail/listing-detail.component';
import { LoginComponent } from './components/login/login.component';
import { loadEnv } from './env';

@NgModule({
  declarations: [
    App,
    HeaderComponent,
    HomeComponent,
    ListingFormComponent,
    ListingDetailComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
    { provide: APP_INITIALIZER, useFactory: loadEnv, multi: true }
  ],
  bootstrap: [App]
})
export class AppModule { }
