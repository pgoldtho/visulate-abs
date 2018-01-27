import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { UsIndexService } from '../us-index.service';
import { UsSummary } from '../us-summary';

@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.css']
})
export class AssetDetailsComponent implements OnInit {

  assetDetail: UsSummary[];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private indexService: UsIndexService
  ) { }

  ngOnInit() {
    this.addRouterSubscription();
  }

  addRouterSubscription(): void {
    this.route.params.subscribe(params => {
      var state = params['state'];
      var useCode = params['type_code'];
      var name = params['name'];

      this.indexService.getAssetDetails(state, useCode, name)
      .subscribe(UsSummary => this.assetDetail = UsSummary);
    });
  }
}
