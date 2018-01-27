import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { UsIndexService } from '../us-index.service';
import { UsSummary } from '../us-summary';

@Component({
  selector: 'app-property-locations',
  templateUrl: './property-locations.component.html',
  styleUrls: ['./property-locations.component.css']
})
export class PropertyLocationsComponent implements OnInit {
  stateSummary: UsSummary[];

  title: string = 'My first AGM project';
  lat: number = 51.678418;
  lng: number = 7.809007;

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
      this.title = state;
      var centroid = this.indexService.getStateCentroid(this.title);
      this.lat = centroid.lat;
      this.lng = centroid.lng;

      this.indexService.getStateSummary(state, useCode)
      .subscribe(UsSummary => this.stateSummary = UsSummary);
    });
  }

}
