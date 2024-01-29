/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';

import { EMPTY, Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import { Product } from './product.interface';

import { ApiService } from '../core/api.service';

@Injectable({
  providedIn: 'root',
})
export class ProductsService extends ApiService {
  createNewProduct(product: Partial<Product>): Observable<Product> {
    if (!this.endpointEnabled('product')) {
      console.warn(
        'Endpoint "bff" is disabled. To enable change your environment.ts config'
      );
      return EMPTY;
    }

    const url = this.getUrl('product', 'products');
    return this.http.post<Product>(url, product, {headers: {
      'Ocp-Apim-Subscription-Key': this.getSecret('Ocp-Apim-Subscription-Key')
    }});
  }

  editProduct(id: string, changedProduct: Product): Observable<Product> {
    if (!this.endpointEnabled('bff')) {
      console.warn(
        'Endpoint "bff" is disabled. To enable change your environment.ts config'
      );
      return EMPTY;
    }

    const url = this.getUrl('bff', `products/${id}`);
    return this.http.put<Product>(url, changedProduct);
  }

  getProductById(id: string): Observable<any> {
    if (!this.endpointEnabled('product')) {
      console.warn(
        'Endpoint "bff" is disabled. To enable change your environment.ts config'
      );
      return this.http
        .get<Product[]>('/assets/products.json')
        .pipe(
          map(
            (products) => products.find((product) => product.id === id) || null
          )
        );
    }

    const url = this.getUrl('product', `products/${id}`);
    return this.http
      .get<{ product: Product }>(url, {headers: {
        'Ocp-Apim-Subscription-Key': this.getSecret('Ocp-Apim-Subscription-Key')
      }})
  }

  getProducts(): Observable<Product[]> {
    if (!this.endpointEnabled('product')) {
      console.warn(
        'Endpoint "product" is disabled. To enable change your environment.ts config'
      );
      return this.http.get<Product[]>('/assets/products.json');
    }

    const url = this.getUrl('product', 'products');
    return this.http.get<Product[]>(url, {headers: {
      'Ocp-Apim-Subscription-Key': this.getSecret('Ocp-Apim-Subscription-Key')
    }})
  }

  getTotalNumberOfProducts(): Observable<Product[]> {
    if (!this.endpointEnabled('product')) {
      console.warn(
        'Endpoint "product" is disabled. To enable change your environment.ts config'
      );
      return this.http.get<Product[]>('/assets/products.json');
    }

    const url = this.getUrl('product', 'products-total');
    return this.http.get<Product[]>(url, {headers: {
      'Ocp-Apim-Subscription-Key': this.getSecret('Ocp-Apim-Subscription-Key')
    }})
  }

  getProductsForCheckout(ids: string[]): Observable<Product[]> {
    if (!ids.length) {
      return of([]);
    }

    return this.getProducts().pipe(
      map((products) => products.filter((product) => ids.includes(product.id)))
    );
  }
}
