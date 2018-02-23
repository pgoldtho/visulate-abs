import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UsIndexService } from '../us-index.service';
import { UsSummary } from '../us-summary';
import { SharedService } from "../shared.service";
import { AppComponent } from "../app.component";

interface UsState {
  name: string,
  code: string
}

interface UsageSummary {
  type_code: string,
  usage_type: string,
  doc_count: string,
  average_secnoi: string,
  average_secvalue: string,
  sec_caprate: string
}

@Component({
  selector: 'app-us-index',
  templateUrl: './us-index.component.html',
  styleUrls: ['./us-index.component.css']
})
export class UsIndexComponent implements OnInit {
  usSummary: UsSummary[];
  states: UsState[];
  selectedState: UsState;

  stateUsageSummary: UsageSummary[];
  selectedUsage: UsageSummary;

  constructor(
    private usIndexService: UsIndexService,
    private router: Router,
    private sharedService: SharedService,
    private appComponent: AppComponent
    ) {}

  ngOnInit() {
    this.sharedService.statesObservable$.subscribe( data => {
      if(data) {
        this.usSummary = data[0];
        this.states = data[1];
      }
    });
  }

  getDisplaySummary(usageArray: UsageSummary[]): UsageSummary[] {
    var displaySummary = [];
    for (let i in usageArray) {
      if (usageArray[i].usage_type) {
      //  var d = filter('currency')(usageArray[i].average_secnoi, '$', 0);
        displaySummary.push({
          "type_code": usageArray[i].type_code,
          "usage_type": usageArray[i].usage_type,
          "doc_count": usageArray[i].doc_count,
        //  "average_secnoi": $filter('currency')(usageArray[i].average_secnoi, '$', 0),
        "average_secnoi": usageArray[i].average_secnoi,
          "average_secvalue": usageArray[i].average_secvalue,
          "sec_caprate": usageArray[i].sec_caprate}

          );
      }
    }
    return displaySummary;
  }

  onChangeState(state){
    this.selectedState = state;
    for (let i in this.usSummary["state"]){
      if (this.usSummary["state"][i]["state"] == state.code ) {
        this.stateUsageSummary = this.getDisplaySummary(this.usSummary["state"][i]["usage"]);
      }
    }
  }

  onRowSelect(useType){
    this.appComponent.navigate(this.selectedState.code, useType.type_code);
  }

}
