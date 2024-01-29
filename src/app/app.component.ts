import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {ProductsService} from './products/products.service';
import {AppConfigService} from './shared/app-config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  products$: Observable<any>;
  product$: Observable<any>;
  appConfigData$: Observable<any>;
  totalProducts$: Observable<any>;

  productTitle = new FormControl('test product title', [Validators.required]);
  productPrice = new FormControl(500, [Validators.required]);
  productForm: FormGroup

  constructor(private productsService: ProductsService, private appConfigService: AppConfigService, private cdr: ChangeDetectorRef) {
    this.products$ = this.productsService.getProducts();
    this.product$ = this.productsService.getProductById('2424b9c8-7db0-4fcb-aad9-80681a86bebc');
    this.totalProducts$ = this.productsService.getTotalNumberOfProducts();
    this.appConfigData$ = this.appConfigService.getDataFromAppConfig();

    this.productForm = new FormGroup({
      productTitle: this.productTitle,
      productPrice: this.productPrice
    })
  }

  createProduct() {
    this.productsService.createNewProduct({
      title: this.productForm.value.productTitle,
      price: this.productForm.value.productPrice,
    }).subscribe((product) => {
      console.log('product created!', product);
      this.products$ = this.productsService.getProducts();
      this.cdr.detectChanges();
    })
  }
}
