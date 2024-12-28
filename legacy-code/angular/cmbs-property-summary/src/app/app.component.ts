import { Component, OnInit, Directive  } from '@angular/core';
import { Router, RoutesRecognized } from "@angular/router";

import { UsSummary } from './us-summary';
import { UsIndexService } from "./us-index.service";
import { Observable } from "rxjs/Observable";
import { SharedService } from "./shared.service";

interface DropdownValue {
  name: string,
  code: string
}


@Directive()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [SharedService]
})
export class AppComponent implements OnInit {

  usSummary: UsSummary[];

  states: DropdownValue[];
  selectedState: DropdownValue;

  types: DropdownValue[];
  selectedType: DropdownValue;

  activePage: string;

  constructor(
    private router: Router,
    private usIndexService: UsIndexService,
    private sharedService: SharedService
  ) {
    this.getIndex();
  }

  getIndex(): void {
    this.usIndexService.getUsSummary().subscribe(UsSummary => this.populateStateStructures(UsSummary));
    this.usIndexService.getDepositorsSummary().subscribe(summary => this.populateDepositorStructure(summary));
  }

  populateStateStructures(usSummary: UsSummary[]): void {
    let states = [];
    for (let i in usSummary["state"]) {
      if (usSummary["state"][i]["name"]) {
        states.push({"name": usSummary["state"][i]["name"],
                    "code": usSummary["state"][i]["state"]});
      }
    }
    this.sharedService.addStates([usSummary, states]);
  }

  populateDepositorStructure(summary): void {
    let depositors = [];
    for(let i in summary['depositor']) {
      depositors.push({'name': summary['depositor'][i]['name'],
                      'code': summary['depositor'][i]['cik']});
    }
    this.sharedService.addDepositors([summary, depositors]);
  }

  ngOnInit(): void {
    this.router.events.subscribe( event => {
      if(event instanceof RoutesRecognized) {
        let params = event.state.root.firstChild.params;

        if(params.state) {
          this.activePage = 'locations';
        } else {
          this.activePage = 'home';
        }

        this.sharedService.statesObservable$.subscribe( data => {
          if(data) {
            this.usSummary = data[0];
            this.states = data[1];
            this.setStateData(params.state, params.type_code);
          }
        });
      }
    });
  }

  setStateData(stateCode, typeCode) {
    this.usSummary["state"].forEach( state => {
      if(state.state === stateCode) {
        this.selectedState = { "name": state.name, "code": state.state };
        this.types = [];
        state.usage.forEach( type => {
          if(type.usage_type) {
            this.types.push({"name": type.usage_type, "code": type.type_code});
          }
        });
        this.selectedType = null;
        this.types.forEach( type => {
          if(type.code === typeCode) {
            this.selectedType = type;
          }
        });
        if(!this.selectedType) {
          this.selectedType = this.types[0];
        }
      }
    });
  }

  onNavChange(event, eventType) {
    switch(eventType) {
      case 'state':
        this.setStateData(event.code, this.selectedType.code);
        break;
      case 'type':
        this.setStateData(this.selectedState.code, event.code);
    }
    this.navigate(this.selectedState.code, this.selectedType.code);
  }

  navigate(param1, param2) {
    if(param2) {
      this.router.navigateByUrl(`/locations/${param1}/${param2}`);
    } else {
      this.router.navigateByUrl(`/issuing-entity/${param1}`);
    }
  }


}
