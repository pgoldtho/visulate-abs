import { Injectable } from '@angular/core';
import {  HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { UsSummary} from './us-summary';

@Injectable()
export class UsIndexService {

  constructor(
    private http: HttpClient ) { }

    getUsSummary(): Observable<UsSummary[]> {
      return this.http.get<UsSummary[]>('http://localhost');
    }

}
