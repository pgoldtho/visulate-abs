import { Injectable } from '@angular/core';
import {  HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { UsSummary} from './us-summary';
import { API_BASE_URL } from './constants';

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

    getAssetDetails(state, useCode, name): Observable<UsSummary[]> {
      return this.http.get<UsSummary[]>(API_BASE_URL + 'asset/'+state+'/'+useCode+'/'+name);
    }

}
