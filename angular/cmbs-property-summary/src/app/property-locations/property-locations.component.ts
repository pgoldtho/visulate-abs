import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  header: string;
  state: string;
  type: string;
  name: string;
  imgUrl: string;

  private convertStringToNumber(value: string): number {
    return +value;
  }

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private indexService: UsIndexService
  ) { }

  ngOnInit(): void {
    this.addRouterSubscription();
  }

  addRouterSubscription(): void {
    this.route.params.subscribe(params => {
      var state = params['state'];
      var useCode = params['type_code'];

      this.indexService.getStateSummary(state, useCode)
      .subscribe(UsSummary => this.stateSummary = UsSummary);
    });
  }

  mapReady(map) {
    let bounds = new google.maps.LatLngBounds();
    for(let p of this.stateSummary['property']) {
      if(p.location) {
        bounds.extend({ lat: p.location.lat, lng: p.location.lon });
      }
    }
    map.fitBounds(bounds);
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
