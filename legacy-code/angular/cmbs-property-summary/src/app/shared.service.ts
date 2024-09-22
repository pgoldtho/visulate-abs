import { Injectable } from '@angular/core';
import { Subject } from "rxjs/Subject";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { UsSummary } from "./us-summary";


@Injectable()
export class SharedService {

  private statesSubject: Subject<any[]> = new BehaviorSubject<any[]>(null);
  statesObservable$ = this.statesSubject.asObservable();

  addStates(data: any[]) {
    this.statesSubject.next(data);
  }

  private depositorsSubject: Subject<any[]> = new BehaviorSubject<any[]>(null);
  depositorsObservable$ = this.depositorsSubject.asObservable();

  addDepositors(data: any[]) {
    this.depositorsSubject.next(data);
  }

}
