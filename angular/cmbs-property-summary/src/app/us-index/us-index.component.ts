import { Component, OnInit } from '@angular/core';
import { UsIndexService } from '../us-index.service';
import { UsSummary } from '../us-summary';
import { Router } from '@angular/router';

interface PrimeNgDropdown {
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
  states: PrimeNgDropdown[];
  selectedState: PrimeNgDropdown;

  usage: PrimeNgDropdown[];
  selectUsage: PrimeNgDropdown;

  stateUsageSummary: UsageSummary[];
  selectedUsage: UsageSummary;

  constructor(private usIndexService: UsIndexService,
              private router: Router) {}

  ngOnInit() {
    this.getIndex();
  }

  populateStateStructures(usSummary: UsSummary[]): void {
    this.usSummary = usSummary;
    this.states = [];
    for (let i in usSummary["state"]) {
      if (usSummary["state"][i]["name"]) {
        this.states.push({"name": usSummary["state"][i]["name"],
                          "code": usSummary["state"][i]["state"]});
      }
    }
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
          "sec_caprate": usageArray[i].sec_caprate}
          );

      }
    }
    return displaySummary;
  }

  getUsageValues(usageArray: UsageSummary[]): PrimeNgDropdown[] {
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

  onChangeState(event){
    for (let i in this.usSummary["state"]){
      if (this.usSummary["state"][i]["state"] == event.value.code ) {
        this.stateUsageSummary =
            this.getDisplaySummary(this.usSummary["state"][i]["usage"]);
        this.usage = this.getUsageValues(this.usSummary["state"][i]["usage"]);
      }
    }
  }

  onRowSelect(event){
    if (event.type === 'row') {
       this.router.navigateByUrl(`/locations/${this.selectedState.code}/${event.data.type_code}`);
     } else {
        this.router.navigateByUrl(`/locations/${this.selectedState.code}/${event.value.code}`);
     }
  }

  getIndex(): void {
    this.usIndexService.getUsSummary()
    .subscribe(UsSummary => this.populateStateStructures(UsSummary));
  }

}
