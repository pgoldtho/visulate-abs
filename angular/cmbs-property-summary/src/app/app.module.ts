import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatExpansionModule } from '@angular/material/expansion';
import { AgmCoreModule } from '@agm/core';

import { AppComponent } from './app.component';
import { UsIndexComponent } from './us-index/us-index.component';
import { UsIndexService } from './us-index.service';
import { AppRoutingModule } from './/app-routing.module';
import { PropertyLocationsComponent } from './property-locations/property-locations.component';
import { AssetDetailsComponent } from './asset-details/asset-details.component';


@NgModule({
  declarations: [
    AppComponent,
    UsIndexComponent,
    PropertyLocationsComponent,
    AssetDetailsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NoopAnimationsModule,
    MatExpansionModule,
    AppRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAWcpVN8-finPP0vUibiXJyzPdTiKqzD6M'
    })
  ],
  providers: [UsIndexService],
  bootstrap: [AppComponent]
})
export class AppModule { }
