import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UsIndexService } from '../us-index.service';
import { UsSummary } from '../us-summary';
import { SharedService } from "../shared.service";
import { AppComponent } from "../app.component";
import { DepositorsSummary } from "../depositors-summary";

interface DropdownValue {
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
  states: DropdownValue[];
  selectedState: DropdownValue;
  usage: DropdownValue[];
  stateUsageSummary: UsageSummary[];

  depositorsSummary: DepositorsSummary;
  depositors: DropdownValue[];
  selectedDepositor: DropdownValue;
  issuers: DropdownValue[];

  searchMode: string;

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
        this.searchMode = 'location';
      }
    });
    this.sharedService.depositorsObservable$.subscribe( data => {
      if(data) {
        this.depositorsSummary = data[0];
        this.depositors = data[1];
      }
    });
  }

  getDisplaySummary(usageArray: UsageSummary[]): UsageSummary[] {
    var displaySummary = [];
    for (let i in usageArray) {
      if (usageArray[i].usage_type) {
        displaySummary.push({
          "type_code": usageArray[i].type_code,
          "usage_type": usageArray[i].usage_type,
          "doc_count": usageArray[i].doc_count,
          "average_secnoi": usageArray[i].average_secnoi,
          "average_secvalue": usageArray[i].average_secvalue,
          "sec_caprate": usageArray[i].sec_caprate
        });
      }
    }
    return displaySummary;
  }

  onSelectState(state) {
    this.selectedState = state;
    for(let i in this.usSummary["state"]) {
      if(this.usSummary["state"][i]["state"] == state.code) {
        let usage = this.usSummary["state"][i]["usage"];
        this.stateUsageSummary = this.getDisplaySummary(usage);
        this.usage = this.getUsageValues(usage);
      }
    }
  }

  getUsageValues(usageArray: UsageSummary[]): DropdownValue[] {
    var dropDownValues = [];
    for (let i in usageArray) {
      if (usageArray[i].usage_type) {
        dropDownValues.push ({
          "name" : usageArray[i].usage_type,
          "code" : usageArray[i].type_code
        });
      }
    }
    return dropDownValues;
  }

  onSelectType(usageCode) {
    this.appComponent.navigate(this.selectedState.code, usageCode);
  }

  onSelectDepositor(depositor) {
    this.selectedDepositor = depositor;
    for(let i in this.depositorsSummary['depositor']) {
      if(this.depositorsSummary['depositor'][i]['name'] == depositor.name) {
        this.issuers = this.getIssuerValues(this.depositorsSummary['depositor'][i]['issuer']);
      }
    }
  }

  getIssuerValues(issuerArray): DropdownValue[] {
    let dropDownValues = [];
    for(let i in issuerArray) {
      dropDownValues.push({
        'name': issuerArray[i].name,
        'code': issuerArray[i].cik
      });
    }
    return dropDownValues;
  }

  onSelectIssuer(cik) {
    this.appComponent.navigate(cik, null);
  }

}
