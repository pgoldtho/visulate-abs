import { Injectable } from '@angular/core';
import {  HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { UsSummary} from './us-summary';

@Injectable()
export class UsIndexService {

  coords: {lat: number; lng: number};

  constructor(
    private http: HttpClient ) { }

    getUsSummary(): Observable<UsSummary[]> {
      return this.http.get<UsSummary[]>('http://localhost');
    }

    getStateSummary(state, useCode): Observable<UsSummary[]> {
      return this.http.get<UsSummary[]>('http://localhost/type/'+state+'/'+useCode);
    }

    getAssetDetails(state, useCode, name): Observable<UsSummary[]> {
      return this.http.get<UsSummary[]>('http://localhost/asset/'+state+'/'+useCode+'/'+name);
    }

    getStateCentroid(stateCode: string): {lat: number; lng: number} {
      switch(stateCode) {
        case 'AL': return {lat: 33.001471, lng: -86.766233};
        case 'AK': return {lat: 61.288254, lng: -148.716968};
        case 'AR': return {lat: 35.080251, lng: -92.576816};
        case 'AZ': return {lat: 33.373506, lng: -111.828711};
        case 'CA': return {lat: 35.458606, lng: -119.355165};
        case 'CO': return {lat: 39.500656, lng: -105.203628};
        case 'CT': return {lat: 41.494852, lng: -72.874365};
        case 'DC': return {lat: 38.910092, lng: -77.014001};
        case 'DE': return {lat: 39.397164, lng: -75.561908};
        case 'FL': return {lat: 27.79585, lng: -81.634622};
        case 'GA': return {lat: 33.332208, lng: -83.868887};
        case 'HI': return {lat: 21.146768, lng: -157.524452};
        case 'IA': return {lat: 42.011539, lng: -93.210526};
        case 'ID': return {lat: 44.242605, lng: -115.133222};
        case 'IL': return {lat: 41.278216, lng: -88.380238};
        case 'IN': return {lat: 39.849426, lng: -86.258278};
        case 'KS': return {lat: 38.454303, lng: -96.536052};
        case 'KY': return {lat: 37.808159, lng: -85.241819};
        case 'LA': return {lat: 30.69927, lng: -91.457133};
        case 'MA': return {lat: 42.271831, lng: -71.363628};
        case 'MD': return {lat: 39.145653, lng: -76.797396};
        case 'ME': return {lat: 44.313614, lng: -69.719931};
        case 'MI': return {lat: 42.866412, lng: -84.170753};
        case 'MN': return {lat: 45.210782, lng: -93.583003};
        case 'MO': return {lat: 38.437715, lng: -92.15377};
        case 'MS': return {lat: 32.56642, lng: -89.593164};
        case 'MT': return {lat: 46.921925, lng: -110.454353};
        case 'NC': return {lat: 35.630066, lng: -79.806419};
        case 'ND': return {lat: 47.528912, lng: -99.784012};
        case 'NE': return {lat: 41.125370, lng: -98.268082};
        case 'NV': return {lat: 37.165965, lng: -116.304648};
        case 'NM': return {lat: 34.623012, lng: -106.342108};
        case 'NJ': return {lat: 41.507548, lng: -74.645228};
        case 'NH': return {lat: 43.153046, lng: -71.463342};
        case 'NY': return {lat: 41.507548, lng: -74.645228};
        case 'OK': return {lat: 35.59794, lng: -96.834653};
        case 'OH': return {lat: 40.480854, lng: -82.749366};
        case 'OR': return {lat: 44.732273, lng: -122.579524};
        case 'PA': return {lat: 40.463528, lng: -77.075925};
        case 'PR': return {lat: 18.19958, lng: -66.58765};
        case 'RI': return {lat: 41.753318, lng: -71.448902};
        case 'SC': return {lat: 34.034551, lng: -81.032387};
        case 'SD': return {lat: 44.047502, lng: -99.043799};
        case 'TN': return {lat: 35.795862, lng: -86.397772};
        case 'TX': return {lat: 30.943149, lng: -97.388631};
        case 'UT': return {lat: 40.438987, lng: -111.90016};
        case 'VA': return {lat: 37.750345, lng: -77.835857};
        case 'VT': return {lat: 44.081127, lng: -72.814309};
        case 'WA': return {lat: 47.341728, lng: -121.624501};
        case 'WI': return {lat: 43.728544, lng: -89.001006};
        case 'WV': return {lat: 38.767195, lng: -80.820221};
        case 'WY': return {lat: 42.675762, lng: -107.008835};
        default: return {lat: 37.411764, lng: -92.394544};

      }

    }

}
