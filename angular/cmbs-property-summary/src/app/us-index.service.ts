import { Injectable } from '@angular/core';
import {  HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { UsSummary} from './us-summary';
import { API_BASE_URL } from './constants';
import { DepositorsSummary } from "./depositors-summary";

@Injectable()
export class UsIndexService {

  coords: {lat: number; lng: number};

  constructor(
    private http: HttpClient ) { }

    getUsSummary(): Observable<UsSummary[]> {
      return this.http.get<UsSummary[]>(API_BASE_URL);
    }

    getStateSummary(state, useCode): Observable<UsSummary[]> {
      return this.http.get<UsSummary[]>(API_BASE_URL + 'type/'+state+'/'+useCode);
    }

    getDepositorsSummary(): Observable<DepositorsSummary> {
      return this.http.get<DepositorsSummary>(API_BASE_URL + 'issuer');
    }

    getIssuersSummary(cik): Observable<any> {
      return this.http.get(API_BASE_URL + 'issuer/'+cik);
    }

    getAssetDetails(state, useCode, name): Observable<UsSummary[]> {
      return this.http.get<UsSummary[]>(API_BASE_URL + 'asset/'+state+'/'+useCode+'/'+name);
    }


}
