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
  properties: any[];

  map: any;
  zoom: any;
  center: any;

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
      this.zoom = null;
      this.center = null;
      this.name = null;
      this.indexService.getStateSummary(this.state, this.type).subscribe( stateSummary => {
        this.properties = stateSummary['property'].filter(i => i.location);
        if(this.map) {
          this.setMapBounds();
          this.map.getStreetView().setVisible(false);
        }
      });
    });
  }

  showDetails(property) {
    if(!this.name) {
      this.zoom = this.map.getZoom();
      this.center = this.map.getCenter();
      this.map.setZoom(15);
      google.maps.event.addListenerOnce(this.map, 'idle', () => {
        this.map.setCenter({ lat: property.location.lat, lng: property.location.lon });
      });
    } else {
      this.map.setCenter({ lat: property.location.lat, lng: property.location.lon });
    }
    this.name = property.name;
    this.showStreetView(property);
  }

  showStreetView(property) {
    let streetView = this.map.getStreetView();
    let streetViewService = new google.maps.StreetViewService();
    const INC_DISTANCE = 10;
    const MAX_DISTANCE = 100;
    let resolveStreetView = (propertyLocation, distanceRadius) => {
      streetViewService.getPanoramaByLocation(propertyLocation, distanceRadius, (panoData, panoStatus) => {
        if(panoStatus == google.maps.StreetViewStatus.OK) {
          let streetViewTruckLocation = panoData.location.latLng;
          let streetViewHeading = google.maps.geometry.spherical.computeHeading(streetViewTruckLocation, propertyLocation);
          streetView.setPosition(streetViewTruckLocation);
          streetView.setPov({ heading: streetViewHeading, pitch: 0});
          streetView.setVisible(true);
        } else if(distanceRadius < MAX_DISTANCE) {
          resolveStreetView(propertyLocation, distanceRadius+INC_DISTANCE);
        }
      });
    }
    let location = new google.maps.LatLng(property.location.lat, property.location.lon);
    resolveStreetView(location, INC_DISTANCE);
  }

  backToList() {
    this.map.setZoom(this.zoom);
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      this.map.setCenter(this.center);
    });
    this.map.getStreetView().setVisible(false);
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
    this.checkZoom();
  }

  checkZoom() {
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      if(this.map.getZoom() > 7) {
        this.map.setZoom(7);
      }
    });
  }

}
