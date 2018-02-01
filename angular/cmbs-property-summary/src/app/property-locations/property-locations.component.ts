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
  assetDetail: UsSummary[];

  title: string = 'My first AGM project';
  lat: number = 51.678418;
  lng: number = 7.809007;

  header: string;

  propShowing = false;
  assetShowing = false;

  property = [];
  asset = [];

  map: any;

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

  showDetails(state, type, name) {
    this.indexService.getAssetDetails(state, type, name).subscribe( UsSummary => {
      this.assetDetail = UsSummary;
      let property = this.assetDetail[0]['property'];
      this.header = property.propertyName;
      this.property = Object.keys(property).map(k => ({ name: k, value: property[k] }));
      this.property = this.property.filter(i => i.name !== 'location');
      this.propDataSource = new MyDataSource(this.property);
      let asset = this.assetDetail[0]['asset'];
      this.asset = Object.keys(asset).map(k => ({ name: k, value: asset[k]}));
      this.assetDataSource = new MyDataSource(this.asset);
    });
  }

  displayedColumns = ['name', 'value'];
  propDataSource: MyDataSource;
  assetDataSource: MyDataSource;

  spaceAndCap(name: string) {
    let result = name.replace(/[A-Z]/g, c => ' '+c);
    return result.replace(result.substring(0, 1), result.substring(0, 1).toUpperCase());
  }

  windowClosed() {
    this.assetDetail = null;
  }

  // mapReady(map) {
  //   this.map = map;
  //   this.map.fitBounds(this.getMapBounds());
  // }

  // getMapBounds() {
  //   if(this.stateSummary) {
  //     let bounds: LatLngBounds = new google.maps.LatLngBounds();
  //     for(let m of this.stateSummary['property']) {
  //       if(m.location) {
  //         bounds.extend(new google.maps.LatLng(this.convertStringToNumber(m.location.lat), this.convertStringToNumber(m.location.lon)))
  //       }
  //     }
  //     return bounds;
  //   }
  // }

}

export class MyDataSource extends DataSource<Element> {

  constructor(private element: Element[]) {
    super();
  }

  connect(): Observable<Element[]> {
    return Observable.of(this.element);
  }

  disconnect(collectionViewer: CollectionViewer): void { }

}

export interface Element {
  name: string;
  value: string;
}
