import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { UsIndexService } from '../us-index.service';
import { UsSummary } from '../us-summary';

import { MatTableDataSource } from '@angular/material/table';
import { DataSource } from "@angular/cdk/table";
import 'rxjs/add/observable/of';
import { Observable, of } from "rxjs";
import { CollectionViewer } from "@angular/cdk/collections";

@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.css']
})
export class AssetDetailsComponent {

  assetDetail: any;

  property = [];
  asset = [];
  assetDisplayList = [];

  displayedColumns = ['name', 'value'];
  propDataSource: MyDataSource;
  assetDataSource: MyDataSource;

  header: string;
  assetHeader: string;

  propShowing = true;
  collapseAsset = [];

  @Input() state: string;
  @Input() type: string;
  @Input() name: string;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private indexService: UsIndexService
  ) { }


  ngOnChanges() {
    var self = this;
    if(this.name) {
      var state = this.state;
      var useCode = this.type;
      var name = this.name;
      this.indexService.getAssetDetails(state, useCode, name).subscribe( UsSummary => {
        this.assetDetail = UsSummary;
        let property = this.assetDetail[0]['property'];
        this.header = property.Property;
        this.property = Object.keys(property).map(k => ({ name: k, value: property[k] }));
        this.property = this.property.filter(i => i.name !== 'location');
        this.propDataSource = new MyDataSource(this.property);

        let assetList = this.assetDetail.issuingEntity.entity_list;
        assetList.forEach(function (assetInstance) {
          var assetObj = {} as any;
          assetObj.cik = assetInstance['CIK'];
          assetObj.header = assetInstance['Loan'] + ' ' +  assetInstance['Raw']['asset']['Loan Structure']
                           + ' originated by ' + assetInstance['Raw']['asset']['Originator'] ;
          assetObj.content =   Object.keys(assetInstance['Raw']['asset']).map(k => ({ name: k, value: assetInstance['Raw']['asset'][k]}));
          self.assetDisplayList.push(assetObj);
          self.collapseAsset[assetObj.cik] = true;
        })
      });

    }
  }

  toggleDisplay(cik: string) {
    this.collapseAsset[cik] = !this.collapseAsset[cik];
  }

  spaceAndCap(name: string) {
    let result = name.replace(/[A-Z]/g, c => ' '+c);
    return result.replace(result.substring(0, 1), result.substring(0, 1).toUpperCase());
  }

}

export class MyDataSource extends DataSource<Element> {

  constructor(private element: Element[]) {
    super();
  }

  connect(): Observable<Element[]> {
    return of(this.element);
  }

  disconnect(collectionViewer: CollectionViewer): void { }

}

export interface Element {
  name: string;
  value: string;
}
