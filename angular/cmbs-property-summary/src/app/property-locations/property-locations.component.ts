import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from "rxjs/Observable";
import { CollectionViewer } from "@angular/cdk/collections";
import { DataSource } from "@angular/cdk/collections";

import { UsIndexService } from '../us-index.service';
import { GOOGLE_MAPS_APIKEY } from '../constants';

declare let google: any;

@Component({
  selector: 'app-property-locations',
  templateUrl: './property-locations.component.html',
  styleUrls: ['./property-locations.component.css']
})
export class PropertyLocationsComponent implements OnInit {

  state: string;
  type: string;
  name: string;
  imgUrl: string;

  map: any;


  properties: any[];


  private convertStringToNumber(value: string): number {
    return +value;
  }

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private indexService: UsIndexService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.addRouterSubscription();
  }

  addRouterSubscription(): void {
    this.route.params.subscribe( params => {
      this.state = params['state'];
      this.type = params['type_code'];
      this.indexService.getStateSummary(this.state, this.type).subscribe( stateSummary => {
        this.properties = stateSummary['property'].filter(i => i.location);
        if(this.map) {
          this.setMapBounds();
        }
        console.log(this.properties);
      });
      if(this.name) {
        this.name = null;
      }
    });
  }


  mapReady(map) {
    this.map = map;
    this.setMapBounds();
  }

  setMapBounds() {
    let bounds =  new google.maps.LatLngBounds();
    for(let p of this.properties) {
      bounds.extend({ lat: p.location.lat, lng: p.location.lon });
    }
    this.map.fitBounds(bounds);
  }

  showDetails(state, type, marker) {
    this.state = state;
    this.type = type;
    this.name = marker.name;

    this.imgUrl = 'https://maps.googleapis.com/maps/api/streetview?size=200x150&location=' +
    marker.location.lat + ',' + marker.location.lon + '&sensor=false&key=' + GOOGLE_MAPS_APIKEY;

    this.map.setCenter({ lat: marker.location.lat, lng: marker.location.lon });
    this.map.setZoom(15);
  }

}
