
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  currentCategoryName: string = "";
  searchMode: boolean = false;

  //props for pagination
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;

  previousKeyword: string=null;



  constructor(private productService: ProductService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');
    if (this.searchMode) {
      this.handleSearchtProducts();
    }
    else {
      this.handleListProducts();
    }



  }
  handleSearchtProducts() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword');

    //if we have different keyword than prev, set page number to 1
    if (this.previousKeyword != theKeyword){
      this.thePageNumber=1;
    }

    this.previousKeyword = theKeyword;

    console.log(`keyword=${theKeyword}, thePageNumber=${this.thePageNumber}`);


    //search using keyword
    this.productService.searchProductsPaginate(this.thePageNumber-1,
                                               this.thePageSize,
                                               theKeyword).subscribe(this.processResult());
                                               
  }

  handleListProducts() {
    //check if id param is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      //get id and convert to string using +
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id');

      //get the name param string
      this.currentCategoryName = this.route.snapshot.paramMap.get('name');
    }
    else {
      //not category id found, we set default to 1
      this.currentCategoryId = 1;
      this.currentCategoryName = 'Books';
    }


    //check if we have a different category than previous 
    //angular will reuse a component if it is currently viewed

    //if we have a different category id we'll reset the page back to 1
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;

    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);



    //get the products for the given id
    this.productService.getProductListPaginate(this.thePageNumber - 1, //-1 because in Spring pages start with 0 but in Angular they start with 1
      this.thePageSize,
      this.currentCategoryId)
      .subscribe(this.processResult());
  }

  processResult() {
    return (data: { _embedded: { products: Product[]; }; page: { number: number; size: number; totalElements: number; }; }) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1; //+1 because in Spring pages start with 0 but in Angular they start with 1
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    }
  }

  updatePageSize(pageSize: number){
    this.thePageSize=pageSize;
    this.thePageNumber=1;
    this.listProducts();
  }
}