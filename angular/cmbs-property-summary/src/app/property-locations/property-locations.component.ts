import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { UsIndexService } from '../us-index.service';
import { UsSummary } from '../us-summary';
import { Observable } from "rxjs/Observable";
import { CollectionViewer } from "@angular/cdk/collections";
import { DataSource } from "@angular/cdk/collections";


@Component({
  selector: 'app-property-locations',
  templateUrl: './property-locations.component.html',
  styleUrls: ['./property-locations.component.css']
})
export class PropertyLocationsComponent implements OnInit {
  stateSummary: UsSummary[];

  lat: number = 51.678418;
  lng: number = 7.809007;

  header: string;

  map: any;

  state: string;
  type: string;
  name: string;

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
      var centroid = this.indexService.getStateCentroid(state);
      this.lat = centroid.lat;
      this.lng = centroid.lng;

      this.indexService.getStateSummary(state, useCode)
      .subscribe(UsSummary => this.stateSummary = UsSummary);
    });
  }

  showDetails(state, type, name) {
    this.state = state;
    this.type = type;
    this.name = name;
  }

  spaceAndCap(name: string) {
    let result = name.replace(/[A-Z]/g, c => ' '+c);
    return result.replace(result.substring(0, 1), result.substring(0, 1).toUpperCase());
  }

}
