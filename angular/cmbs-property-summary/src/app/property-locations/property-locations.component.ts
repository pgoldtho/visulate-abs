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
export class PropertyLocationsComponent {

  state: string;
  type: string;
  name: string;
  properties: any[];
  displayedColumns = ['name', 'value'];
  issuerCik: string;
  collapseAsset = [];

  title: string;
  summary: html;
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

  mapReady(map) {
    this.map = map;
    this.addRouterSubscription();
  }

  addRouterSubscription(): void {
    this.route.params.subscribe( params => {
      if(params['state']) {
        this.state = params['state'];
        this.type = params['type_code'];
        this.zoom = null;
        this.center = null;
        this.name = null;

        this.indexService.getStateSummary(this.state, this.type).subscribe( stateSummary => {
          this.title = stateSummary['state'] + ' ' + stateSummary['type'];
          this.summary = stateSummary['text_description'];
          this.properties = stateSummary['property'].filter(i => i.location);
          this.properties.sort( (a, b) => {
            let x = a.city_name.toLowerCase();
            let y = b.city_name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
          });
          this.setMapBounds();
          this.map.getStreetView().setVisible(false);
          if(params['property_name']) {
            this.goToPropertyByName(params['property_name']);
          }
        });
      } else if(params['issuer_cik']) {
        this.issuerCik = params['issuer_cik'];
        this.indexService.getIssuersSummary(params['issuer_cik']).subscribe( issuerSummary => {
          this.title = issuerSummary['issuing_entity'];
          this.summary = issuerSummary['text_description'];
          this.properties = issuerSummary['property'].filter(i => i.location);
          this.properties.sort( (a, b) => {
            let x = a.state_code + a.city_name.toLowerCase();
            let y = b.state_code + b.city_name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
          });
          this.setMapBounds();

          this.assetList = Object.values(issuerSummary['asset_summary']['asset']);
          this.assetDisplayList = [];
          var self = this;
          this.assetList.forEach(function (assetInstance) {
            var assetObj = new Object();

            assetObj.header = assetInstance['Original Loan']

            assetObj.id = assetInstance['Asset'];
            if (assetInstance['Loan Structure'] === 'WL') {
              assetObj.header += ' whole loan ';
            } else if (assetInstance['Loan Structure'] === 'PP') {
              assetObj.header += ' pari-passu loan ';
            } else {
              assetObj.header += ' loan ';
            }

            assetObj.header += ' at '+assetInstance['Interest Rate Securitization']
                            + ' originated by ' + assetInstance['Originator']+ ' on '+ assetInstance['Origination'];

            if (assetInstance['Report Period End Scheduled Loan Balance'] !== assetInstance['Report Period End Actual Balance']){
              assetObj.header += '. Scheduled balance on was' + assetInstance['Reporting Period End'] + ': '
                               + assetInstance['Report Period End Scheduled Loan Balance']
                               + ' actual balance was ' + assetInstance['Report Period End Actual Balance'];
            }
            assetObj.content =   Object.keys(assetInstance).map(k => ({ name: k, value: assetInstance[k]}));
            self.assetDisplayList.push(assetObj);
            self.collapseAsset[assetObj.id] = true;
          });

          if(params['property_name']) {
            this.goToPropertyByName(params['property_name']);
          }
        });
      }
    });
  }

  goToPropertyByName(propertyName) {
    this.properties.forEach( prop => {
      if(prop.name == propertyName) {
        this.showDetails(prop);
      }
    });
  }

  showDetails(property) {
    if(this.issuerCik) {
      this.state = property.state_code;
      this.type = property.type_code;
      this.location.go(`issuing-entity/${this.issuerCik}/${encodeURIComponent(property.name)}`);
    } else {
      this.location.go(`locations/${this.state}/${this.type}/${encodeURIComponent(property.name)}`);
    }
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

  toggleDisplay(id: string) {
    this.collapseAsset[id] = !this.collapseAsset[id];
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
    if(this.issuerCik) {
      this.state = null;
      this.type = null;
      this.location.go(`issuing-entity/${this.issuerCik}`);
    } else {
      this.location.go(`locations/${this.state}/${this.type}`);
    }
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
