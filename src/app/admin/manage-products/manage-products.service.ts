import { Injectable, Injector } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class ManageProductsService extends ApiService {
  constructor(injector: Injector) {
    super(injector);
  }

  uploadProductsCSV(file: File): Observable<unknown> {
    if (!this.endpointEnabled('import')) {
      console.warn(
        'Endpoint "import" is disabled. To enable change your environment.ts config'
      );
      return EMPTY;
    }

    return this.getPreSignedUrl(file.name).pipe(
      switchMap(({ sasToken }) => {
        console.log('getPreSignedUrl', sasToken)
        return this.http.put(sasToken, file, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Ocp-Apim-Subscription-Key': this.getSecret('Ocp-Apim-Subscription-Key'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'text/csv',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "x-ms-blob-type": "BlockBlob"
          },
        })
      }
        
      )
    );
  }

  private getPreSignedUrl(fileName: string): Observable<any> {
    const url = this.getUrl('import', 'import');

    console.log('%c --->  url', 'color: #de4209', url);

    return this.http.get<string>(url, {
      headers: {
           // eslint-disable-next-line @typescript-eslint/naming-convention
          'Ocp-Apim-Subscription-Key': this.getSecret('Ocp-Apim-Subscription-Key'),
      },
      params: {
        name: fileName,
      },
    });
  }
}
