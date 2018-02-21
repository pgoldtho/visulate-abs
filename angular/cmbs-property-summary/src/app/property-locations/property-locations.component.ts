import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from "rxjs/Observable";
import { CollectionViewer } from "@angular/cdk/collections";
import { DataSource } from "@angular/cdk/collections";

import { UsIndexService } from '../us-index.service';
import { UsSummary } from '../us-summary';
import { GOOGLE_MAPS_APIKEY } from '../constants';

declare let google:any;

@Component({
  selector: 'app-property-locations',
  templateUrl: './property-locations.component.html',
  styleUrls: ['./property-locations.component.css']
})
export class PropertyLocationsComponent implements OnInit {
  stateSummary: UsSummary[];

  state: string;
  type: string;
  name: string;
  imgUrl: string;

  states: UsSummary[] = [];
  stateName: string;
  types: any[] = [];
  typeName: string;

  map: any;
  lastOpen: any;


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
        this.stateSummary = stateSummary;
        if(this.map) {
          this.setMapBounds();
        }
      });
      if(this.name) {
        this.name = null;
      }
      if(this.lastOpen) {
        this.lastOpen = null;
      }
    });
  }


  mapReady(map) {
    this.map = map;
    this.setMapBounds();
  }

  setMapBounds() {
    let bounds = new google.maps.LatLngBounds();
    for(let p of this.stateSummary['property']) {
      if(p.location) {
        bounds.extend({ lat: p.location.lat, lng: p.location.lon });
      }
    }
    this.map.fitBounds(bounds);
  }



  showDetails(state, type, marker) {
    this.state = state;
    this.type = type;
    this.name = marker.name;

    this.imgUrl = 'https://maps.googleapis.com/maps/api/streetview?size=200x150&location=' +
    marker.location.lat + ',' + marker.location.lon + '&sensor=false&key=' + GOOGLE_MAPS_APIKEY;
  }

  spaceAndCap(name: string) {
    let result = name.replace(/[A-Z]/g, c => ' '+c);
    return result.replace(result.substring(0, 1), result.substring(0, 1).toUpperCase());
  }

}
