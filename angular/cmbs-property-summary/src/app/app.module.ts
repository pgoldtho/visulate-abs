import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AgmCoreModule } from '@agm/core';
import { DropdownModule, DataTableModule, SharedModule} from 'primeng/primeng';
import { MDBBootstrapModule } from 'angular-bootstrap-md';


import { AppComponent } from './app.component';
import { UsIndexComponent } from './us-index/us-index.component';
import { UsIndexService } from './us-index.service';
import { AppRoutingModule } from './/app-routing.module';
import { PropertyLocationsComponent } from './property-locations/property-locations.component';
import { AssetDetailsComponent } from './asset-details/asset-details.component';
import { GOOGLE_MAPS_APIKEY } from './constants';



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
    FormsModule,
    NoopAnimationsModule,
    DropdownModule,
    DataTableModule,
    SharedModule,
    MatExpansionModule,
    MatToolbarModule,
    MatIconModule,
    AppRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: GOOGLE_MAPS_APIKEY
    }),
    MatTableModule,
    MDBBootstrapModule.forRoot()
  ],
  providers: [UsIndexService],
  bootstrap: [AppComponent]
})
export class AppModule {}
