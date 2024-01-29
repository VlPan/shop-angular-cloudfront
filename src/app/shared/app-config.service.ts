import { Injectable } from '@angular/core';
import {ApiService} from '../core/api.service';

@Injectable({providedIn: 'root'})
export class AppConfigService extends ApiService {
  getDataFromAppConfig() {
    const url = this.getUrl('appConfig', 'get-data-from-app-config');
    return this.http.get(url, {headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Ocp-Apim-Subscription-Key': this.getSecret('Ocp-Apim-Subscription-Key'),
    },
    responseType: 'text'
  })
  }  
}
