import { Component, OnInit } from '@angular/core';
import { Router, RoutesRecognized } from "@angular/router";

import { UsSummary } from './us-summary';
import { UsIndexService } from "./us-index.service";
import { Observable } from "rxjs/Observable";
import { SharedService } from "./shared.service";

interface UsState {
  name: string,
  code: string
}

interface UseType {
  name: string,
  code: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [SharedService]
})
export class AppComponent implements OnInit {

  usSummary: UsSummary[];

  states: UsState[];
  selectedState: UsState;

  types: UseType[];
  selectedType: UseType;

  constructor(
    private router: Router,
    private usIndexService: UsIndexService,
    private sharedService: SharedService
  ) {
    this.getIndex();
  }

  getIndex(): void {
    this.usIndexService.getUsSummary().subscribe(UsSummary => this.populateStateStructures(UsSummary));
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

  ngOnInit(): void {
    this.router.events.subscribe( event => {
      if(event instanceof RoutesRecognized) {
        let params = event.state.root.firstChild.params;
        this.sharedService.statesObservable$.subscribe( data => {
          if(data) {
            this.usSummary = data[0];
            this.states = data[1];
            this.getStateData(params.state, params.type_code);
          }
        });
      }
    });
  }

  getStateData(stateCode, typeCode) {
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
        this.getStateData(event.code, this.selectedType.code);
        break;
      case 'type':
        this.getStateData(this.selectedState.code, event.code);
    }
    this.navigate(this.selectedState.code, this.selectedType.code);
  }

  navigate(stateCode, typeCode) {
    this.router.navigateByUrl(`/locations/${stateCode}/${typeCode}`);
  }


}
