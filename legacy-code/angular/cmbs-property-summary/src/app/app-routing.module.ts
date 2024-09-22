import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UsIndexComponent } from './us-index/us-index.component';
import { PropertyLocationsComponent } from
         './property-locations/property-locations.component';
import { AssetDetailsComponent } from
         './asset-details/asset-details.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/index',
    pathMatch: 'full'
  },
  {
    path: 'index',
    component: UsIndexComponent

  },
  {
    path:
    'locations/:state/:type_code',
    component: PropertyLocationsComponent
  },
  {
    path: 'asset/:state/:type_code/:name',
    component: AssetDetailsComponent
  },
  {
    path: 'issuing-entity/:issuer_cik',
    component: PropertyLocationsComponent
  },
  {
    path: 'locations/:state/:type_code/:property_name',
    component: PropertyLocationsComponent
  },
  {
    path: 'issuing-entity/:issuer_cik/:property_name',
    component: PropertyLocationsComponent
  }
]

@NgModule({
  imports: [ RouterModule.forRoot(routes)],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
