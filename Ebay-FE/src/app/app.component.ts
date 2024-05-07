import { Component,Injectable, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { SearchResultsComponent } from './search-results/search-results.component';
import { ModalContentComponent } from './modal-content/modal-content.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})


export class AppComponent  {


  
  title = 'assignment3-fe';
  private ipInfoBaseUrl = 'https://ipinfo.io';
  private accessToken_ipinfo = '589e1fc7f69657'; 
  private serverBaseUrl = 'http://localhost:8080/'
  // private serverBaseUrl = 'https://burnished-ember-404408.wl.r.appspot.com/'
  locationData = ''
  disabled_zip = false
  error_message = ''
  errorMessagePinCode=''
  postalCode = ''
  formData = {}
  postal_codes =  new Array([])
  searchResult = new Object([])
  
  @ViewChild(SearchResultsComponent, { static: true })
  child: SearchResultsComponent = new SearchResultsComponent(this.http,this.modalService);

  conditions = [
  {
    name: 'New',
    value:'New'
  },
  {
    name: 'Used',
    value:'Used'
  },
  {
    name: 'Unspecified',
    value:'Unspecified'
  },
  ]
  shipping = [
    {
      name: 'Local Pickup',
      value:'LocalPickupOnly'
    },
    {
      name: 'Free Shipping',
      value:'FreeShippingOnly'

    },
]

autoCompleteError = false
  locationDetected =true
  defaultFormValues = {}
  searchForm = this.formValues.group({
    keywords: ['', Validators.required],
    categoryId: ['All Categories'],
    Condition: new FormArray([]),
    FreeShippingOnly:false,
    LocalPickupOnly:false,
    MaxDistance: [10],
    location:['current_location'],
    buyerPostalCode:['',Validators.required]
 });


ngOnInit()
{
  this.searchForm.get('buyerPostalCode')?.disable()
  

  this.getLocation().subscribe({
        
    next: async(data) => {
      this.locationData = data;
      this.postalCode = data.postal
      console.log(this.locationData,'Location')
  },
  error: (err) => {
    this.locationDetected = false
    // this.showCarData = false
    console.error(err);

    this.defaultFormValues = this.searchForm.value;
}
  
})
}
  constructor(
    private  formValues: FormBuilder, 
    private http: HttpClient,
    private modalService: ModalContentComponent
    
    ) { }


    getLocation(): Observable<any> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.accessToken_ipinfo}`
      });
  
      return this.http.get(`${this.ipInfoBaseUrl}`, { headers });
    }


  onSubmit(){
    this.child.isResponseAvailable = false
    this.child.itemDetailsVisible = false
    this.findItems().subscribe((data) => {
      this.searchResult = data
      this.child.isResponseAvailable = true
     this.child.submitValues(this.searchResult)
    });
   
    
    }
    findItems(): Observable<any> {
      // const headers = new HttpHeaders({
      //   'Authorization': `Bearer ${this.accessToken_ipinfo}`
      // });
      console.log(this.searchForm,'payload-search-item')
      if(this.postalCode && !this.searchForm.value.buyerPostalCode){
        this.searchForm.value.buyerPostalCode = this.postalCode
      }
      this.formData = {
        params: this.searchForm.value
          // buyerPostalCode : 
        

      }

      console.log(this.formData,'check-data-sent')
      return this.http.get(`${this.serverBaseUrl}getItemsByKeyword`, this.formData);
    }


  autocompleteDropDown(value:any){

      this.getPinCodeSuggesstion(value).subscribe({
        
        next: async(data) => {
        console.log(data, data.postalCodes, 'pincode response')
        if(this.autoCompleteError)
        this.autoCompleteError = false
        this.postal_codes = []
        data.postalCodes.forEach((item:any)=>{   
          this.postal_codes.push(item.postalCode)
          if(this.searchForm.value.buyerPostalCode && this.searchForm.value.buyerPostalCode?.length ==5 )
          {
            this.errorMessagePinCode = ''
          }
         

        })
        
      },
      error: (err) => {
        this.autoCompleteError = true
        // this.showCarData = false
        console.error(err);
    }
      
    })


      // this.getPinCodeSuggesstion(value).subscribe({
      //   next: async (response:any) => {
      //       if (response?.data === null) {
      //           // this.showCarData = false;
      //       } else {
      //             // this.showCarData = true;
      //       }
      //   }, 
      //   error: (err) => {
      //       // this.showCarData = false
      //       console.error(err);
      //   }
      // })
   
  
  }


  



    getPinCodeSuggesstion(val:any): Observable<any> {
      var payload = {
        'postalcode_startsWith':val,
        'maxRows':'5',
        'username':'[meghac_]',
        'country':'US'
    }

    var data ={
      params:payload
    }
  
    

      return this.http.get(`${this.serverBaseUrl}pinCodeSuggestion`, data);
   
 
  
    }

  
    onConditionChange(event:any){
      const conditionsArray: FormArray = this.searchForm.get('Condition') as FormArray;
      if(event.target.checked){
        // Add a new control in the arrayForm
        conditionsArray.push(new FormControl(event.target.value));
      }
      /* unselected */
      else{
        // find the unselected element
        let i: number = 0;
    
        conditionsArray.controls.forEach((ctrl) => {
          if(ctrl.value == event.target.value) {
            // Remove the unselected element from the arrayForm
            conditionsArray.removeAt(i);
            return;
          }
    
          i++;
        });
      }
    }


    // onShippingChange(event:any){
      
    //   const shippingArray: FormArray = this.searchForm.get('shipping_options') as FormArray;
    //   if(event.target.checked){
    //     // Add a new control in the arrayForm
    //     shippingArray.push(new FormControl(event.target.value));
    //   }
    //   /* unselected */
    //   else{
    //     // find the unselected element
    //     let i: number = 0;
    
    //     shippingArray.controls.forEach((ctrl) => {
    //       if(ctrl.value == event.target.value) {
    //         // Remove the unselected element from the arrayForm
    //         shippingArray.removeAt(i);
    //         return;
    //       }
    
    //       i++;
    //     });
    //   }
    // }

 onLocationChange(event:any){
  
  if (event.target.value =='other')
  {
    this.searchForm.get('buyerPostalCode')?.enable()
  }
  if(event.target.value == 'current_location')
  {
   
    this.searchForm.get('buyerPostalCode')?.reset()
    this.errorMessagePinCode = ''
  }


  if (event.target.value =='other')
  {
    this.searchForm.value.buyerPostalCode=''
  if(this.searchForm.value.buyerPostalCode == '')
  {
    this.errorMessagePinCode = 'Please Enter a valid zip code'
  }
  else
  
  {
    console.log('in-hereeee')
    this.errorMessagePinCode = ''
  }
 
  }

 }

 isSubmitDisabled()
 {

  
  if(this.error_message || this.errorMessagePinCode || !this.locationDetected || (!this.searchForm.value.buyerPostalCode && !this.postalCode) ||(this.searchForm.value.keywords?.length==0))
  {
    return true
  }
  
  else
  return false

 
 }

 onKeywordChange(event:any){
  if(event.target.value == '' || this.searchForm.value.keywords == '' )
  {
  this.error_message = 'Please enter a keyword'
  return
  }
  this.error_message = ''



 }

 isError(){
  if (this.error_message)
    return true
  return false

 }
 activateWishList(val:any){
  
  this.child.wishListActive = val
  this.child.itemDetailsVisible=false
  if(this.child.wishListedItems.length==0)
  this.child.getWishList()
 }

 onPinCodeChange(event:any){


  if(!this.searchForm.value.buyerPostalCode || this.searchForm.value.buyerPostalCode.length!=5)
  {
    this.errorMessagePinCode = 'Please Enter a valid zip code'
  }
  else
  {
    this.errorMessagePinCode = ''
  }
  
  if (event.target.value)
  {
    this.autocompleteDropDown(event.target.value)
    
  }
  console.log('valllll',this.searchForm.value.buyerPostalCode)
 

  }

  checkPinCode()
  {
    if(!this.searchForm.value.buyerPostalCode || this.searchForm.value.buyerPostalCode.length!=5)
  {
    this.errorMessagePinCode = 'Please Enter a valid zip code'
  }
  else
  {
    this.errorMessagePinCode = ''
  }

  }

  clearForm()
  {
    // this.searchForm.reset({categoryId: {value:['All Categories']}});
    this.searchForm.reset({
      categoryId:  'All Categories',
      MaxDistance: 10,
      location:'current_location'
    });

  // this.searchForm.patchValue(this.defaultFormValues);
    this.child.searchResultTable = []
    this.child.singleItemTable= {}
    this.child.capturedItem = {}
    this.child.shippingItemTable = {}
    this.child.sellerInfoTable = {}
    this.child.similarProductstable = []
    this.errorMessagePinCode = ''
    this.error_message = ''
    console.log(this.searchForm.value.Condition,'checkk')
    for( let condition of this.conditions)
    {
     var checkbox =  document.getElementById(condition.name) as HTMLInputElement
     if(checkbox?.checked)
     {
      checkbox.checked = false
     }
     
    }

    
    
  }

  






}

