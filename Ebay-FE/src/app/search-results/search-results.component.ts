import { Component} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModalContentComponent } from '../modal-content/modal-content.component';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent   {
 
  

  ngOnInit()
  {
  

   if(this.wishListedItems.length==0)
    this.getWishList()
    
    
    
   
  }
  getWishList()

  {
    this.isWishListResponseAvailable = false
    
    this.fetchWishListedItems().subscribe((data:any)=>{
     
     this.wishListedItems = data
     console.log(this.wishListedItems,'check-intial wishlisted items')
    //  this.frameShippingFromWishList(data)
     this.wishlistTotal = 0
    for(let data of this.wishListedItems)
    {
      
      this.wishlistTotal= Number(this.wishlistTotal)+ Number(data['price'])

    }
    this.isWishListResponseAvailable = true
    if (this.wishListedItems.length==0)
    {
      this.noWishList = true
    }
    

    })
  }

  fetchWishListedItems(){

    return this.http.get(`${this.serverBaseUrl}getWishlistedItems`);
  }

  


  searchResultTable: { [key: string]: any }[] = [
    { title: 'Item 1', /* other properties */ },
    { title: 'Item 2', /* other properties */ },
    // Objects with unknown structure
  ];
  wishListedItems: { [key: string]: any }[] = [
    
    // Objects with unknown structure
  ];
  

  similarProductstable: { [key: string]: any }[] = [
   
    // Objects with unknown structure
  ];

preservedSortOrder: { [key: string]: any }[] = [
   
    // Objects with unknown structure
  ];

  moreProducts: { [key: string]: any }[] = [
   
    // Objects with unknown structure
  ];
 

  photoTabLinks:{[key:string]:any}[]=[
    // ...
  ]
  singleItemTable: { [key: string]: any } = {
    // ... your object properties
  };
  capturedItem: { [key: string]: any } = {
    // ... your object properties
  };
  shippingItemTable:{[key:string]:any}={

  }
  sellerInfoTable :{[key:string]:any} = {
    
  }
  wishListActive = false

  isDetailsButtonDisabled = true
  showMoreActive = false
  websiteURL = ''
  wishlistTotal = 0
  noSearchResult = false

  p: number = 1;
  private serverBaseUrl = 'http://localhost:8080/'
  // private serverBaseUrl = 'https://burnished-ember-404408.wl.r.appspot.com/'
  pictureURL = []
  itemTitle = ''
  itemDetailsVisible = false
  sortBy='Default'
  sortOrder='Ascending'
  sortOrderActive = true
  isResponseAvailable = true
  selectedItemid = ''
  noSimilarProducts = false
  noWishList = false
  isWishListResponseAvailable = true
  

 
constructor(
  private http: HttpClient,
  private modalService: ModalContentComponent
  

){
  this.searchResultTable = []
  this.photoTabLinks = []
  this.singleItemTable=[]
  this.sortBy='Default'
  this.sortOrder='Ascending'
  this.showMoreActive = false
  
}


frameShippingFromWishList(data:any)
{

  for(let item of Object.keys(data))
  {
   
    if(item=='Shipping Cost' || item == 'Ship To Locations' || item =='Handling Time' || item =='Expedited Shipping' || item == 'One Day Shipping' || item == 'Return Accepted')
    {
      console.log('in-here')
      this.shippingItemTable[item] = data[item]
    }
  }

}

isSinglItemTableEmpty() {
  if(Object.keys(this.singleItemTable).length < 0 )
  {
    return true
  }
  else 
  {
    return false
  }
}


openModal() {
  this.modalService.openModal(this.pictureURL);
}
objectKeys(value:any)
{
  if (value == `singleItemTable`)
    return Object.keys(this.singleItemTable)
  if (value == 'shippingTable')
    return Object.keys(this.shippingItemTable)
  if (value == 'sellerInfo')
    return Object.keys(this.sellerInfoTable)
    return 

}
submitValues(result: any){
  this.searchResultTable = []
  if(result.searchResult[0]['@count'] == 0)
  {
    this.noSearchResult= true
  }
  else
  {
    if (this.noSearchResult)
    this.noSearchResult = false
    for(let data of result.searchResult[0].item)
    {
      this.searchResultTable.push(data)
    
      
    }
  }
 
 
 console.log(this.searchResultTable,'Search Result')
}


deleteItem(itemId: string): Observable<any> {
  const apiUrl = `${this.serverBaseUrl}removeItem/${itemId}`;
  return this.http.get(apiUrl);
}

deleteFromWishList(itemId:any,price:any){
  console.log(itemId,'from-delete')
  console.log(this.wishListedItems)
  this.deleteItem(itemId).subscribe((data)=>{
    if(data.deletedCount==1)
    {
     
      let index = this.wishListedItems.findIndex((item:any)=> item['_id'] == itemId)
      console.log(index,'check-indexxx')
      this.wishListedItems.splice(index,1)
      this.wishlistTotal = Number(this.wishlistTotal)- Number(price)
      console.log(this.wishListedItems)
     
    }

  })
 
  
}

addToWishList(item:any,fromWishListItem=false){
  
  if(fromWishListItem)
  {
    var wishlistedItem = {
      'title':item['title'],
      'galleryURL':item['galleryURL'] ,
      'price':item['price'],
      'shipping':item['shipping'],
      'zip':item['zip'],
      '_id':item['itemId'][0],
    }
  }  
  else 
  {  
  var wishlistedItem = {
    'title':item['title'][0],
    'galleryURL':item['galleryURL'][0] ,
    'price':item['sellingStatus'][0]['currentPrice'][0]['__value__'],
    'shipping':item['shippingInfo'][0]['shippingServiceCost'][0]['__value__'],
    'zip':item['postalCode'][0],
    '_id':item['itemId'][0],
  }
}

  let wishListData = {
    ...wishlistedItem,
    ...this.shippingItemTable
  }


  

  this.sendToBackend(wishListData).subscribe((data:any)=>{
   
    console.log(data,'response')
    if(data.acknowledged) 
    {
    

      this.wishListedItems.push(wishlistedItem)
      this.wishlistTotal= Number(this.wishlistTotal) + Number(wishlistedItem['price'])
      if(this.noWishList)
      this.noWishList = false
    }
    console.log(this.wishListedItems,'check item pushed')
  })

}

sendToBackend(wishlistedItem:any)
{

  var payloadData = {
    
    params: wishlistedItem
  }

  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json', // Set the appropriate content type
      'Access-Control-Allow-Origin': '*', // Include CORS headers if necessary
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      
    }),
    // withCredentials: true,
  };

  return this.http.get(`${this.serverBaseUrl}insertInWishList`, payloadData);
  



}

isWishListed(itemId:any,fromfacebook=false)
{
 
 
  var item = this.wishListedItems.find(item=>item['_id']== itemId)
  if(item)

  return true
  else
  return false

}

onItemClick(itemId:any,itemObj:any){
  this.itemDetailsVisible = true
  this.capturedItem = itemObj
  if(this.capturedItem['_id'])
    this.capturedItem['itemId']  = [this.capturedItem['_id']]
  if(!this.capturedItem['price'])
  {
this.capturedItem['price'] = itemObj['sellingStatus'][0]['currentPrice'][0]['__value__']
  }
  var return_policy = ''
  this.isResponseAvailable = false
  this.selectedItemid = itemId
  this.moreProducts = []
  this.similarProductstable = []
  this.sellerInfoTable = []
  this.getItemInfo(itemId).subscribe((data) => {
    

  var itemData = data.Item
  this.isResponseAvailable = true
  this.pictureURL = itemData.PictureURL
  this.itemTitle = itemData.Title
  this.websiteURL =itemData.ViewItemURLForNaturalSearch
  console.log(itemData,'single item API')

  if(itemData?.ReturnPolicy?.ReturnsWithin && itemData.ReturnPolicy?.ReturnsAccepted)
  {
    return_policy = `${itemData.ReturnPolicy.ReturnsAccepted}   Within  ${itemData.ReturnPolicy.ReturnsWithin}`
  }
  else 
  {
    return_policy = 'Returns Not Accepted'
  }

  this.singleItemTable = {
    'Return Policy':return_policy,
  }
  if(itemData?.CurrentPrice?.Value)
  {
    this.singleItemTable['Current Price'] = itemData.CurrentPrice.Value
   
  }
  if(itemData?.Location)
  {
    this.singleItemTable['Location'] = itemData.Location
  }
  

  if(itemData?.ItemSpecifics?.NameValueList )
  {
    for( let item of itemData.ItemSpecifics.NameValueList )
    {
      this.singleItemTable[item.Name] = item.Value[0]
      
    }
  }
  

  this.getPhotos()
  this.frameShippingInfo(itemId)  
  this.frameSellerInfo(itemData)
  
  this.isDetailsButtonDisabled = false

  
console.log(this.capturedItem,'checkkkkk')
  })
}

frameShippingInfo(itemId:any)
{
  var itemClicked = this.searchResultTable.find(item=>item['itemId'][0]== itemId)
  if(!itemClicked)
  {
    var itemClicked = this.wishListedItems.find(item=>item['itemId'] == itemId)
    this.frameShippingFromWishList(itemClicked)
  }
  else{
    this.frameShippingItemTable(itemClicked)
  }

}

isRowHighlighted(item:any,fromWishList:boolean){
  if(fromWishList)
  {
    if(this.capturedItem['itemId']==item['_id'] ||this.capturedItem['_id']== item['_id'] )
  return true
else
return false
  }
  else
  {
   

 
  if(this.capturedItem['itemId']==item['itemId'] || this.capturedItem['_id']==item['itemId'])
  {
    return true
    
  }
  
else
return false
}

}

showMore(show_more:any)
{
  if(show_more)
  this.showMoreActive = true
  else 
  this.showMoreActive = false
  
}
getSimilarProducts(itemId:any){
  this.showMoreActive = false
  this.isResponseAvailable = false
  this.fetchSimilarProducts(itemId).subscribe((data:any) => {
    var products = data.getSimilarItemsResponse.itemRecommendations.item
    this.isResponseAvailable = true
    if(data?.getSimilarItemsResponse?.itemRecommendations?.item?.length == 0 || products.length ==0)
    {
      this.noSimilarProducts = true
    }
    else 
    {
      if(this.noSimilarProducts)
      {
        this.noSimilarProducts = false
      }
    }
    console.log(products,'all-similar-products')
    var intial_products = products.slice(0,5)
    var show_more = products.slice(5, products.length)
    console.log(intial_products,'intial-products')
    console.log(show_more,'more products')
    for(let product of products)
    {
      var val = product['timeLeft']
      product['days_left'] = product['timeLeft'].substr((val.indexOf('P')+1),(val.indexOf('D')-1))
      this.preservedSortOrder.push(product)
    }
    for(let product of intial_products)
    {
      var val = product['timeLeft']
      product['days_left'] = product['timeLeft'].substr((val.indexOf('P')+1),(val.indexOf('D')-1))
      this.similarProductstable.push(product)
    }
    
    for(let product of show_more)
    {
      this.moreProducts.push(product)
    }
   });
 
}

fetchSimilarProducts(itemId:any){
  var payloadData = {
    params: {
      'item_id':itemId
    }
  }

  return this.http.get(`${this.serverBaseUrl}getSimilarProducts`,payloadData);

}

frameShippingItemTable(item:any){
  if(item?.shippingInfo[0] && item?.shippingInfo[0]?.shippingServiceCost[0] && item?.shippingInfo[0]?.shippingServiceCost[0]?.__value__ )
  {
    if (item.shippingInfo[0].shippingServiceCost[0].__value__ == 0)
    {
      this.shippingItemTable['Shipping Cost'] = 'Free Shipping'
    }
    else
    {
      this.shippingItemTable['Shipping Cost'] = `$${item.shippingInfo[0].shippingServiceCost[0].__value__}`
    }
  }
  
  if(item?.shippingInfo[0] && item?.shippingInfo[0]?.shipToLocations)
  this.shippingItemTable['Ship To Locations'] = item.shippingInfo[0].shipToLocations[0]

  if(item?.shippingInfo[0] && item?.shippingInfo[0]?.handlingTime[0])
  {
  if (item.shippingInfo[0].handlingTime[0] == 0 || item.shippingInfo[0].handlingTime[0] == 1 )
  {
    this.shippingItemTable['Handling Time'] = `${item.shippingInfo[0].handlingTime[0]} Day`
  }
  else
  {
    this.shippingItemTable['Handling Time'] = `${item.shippingInfo[0].handlingTime[0]} Days`
  }
}

  if(item?.shippingInfo[0]?.expeditedShipping[0])
  this.shippingItemTable['Expedited Shipping'] = item.shippingInfo[0].expeditedShipping[0]
if(item?.shippingInfo[0]?.oneDayShippingAvailable[0])
  this.shippingItemTable['One Day Shipping'] = item.shippingInfo[0].oneDayShippingAvailable[0]
  if(item?.returnsAccepted[0])
  this.shippingItemTable['Return Accepted'] = item.returnsAccepted[0]
  console.log(this.shippingItemTable,'Shipping Data')
}

frameSellerInfo(itemData:any){
  var feedbackscore = itemData.Seller.FeedbackScore
  if( itemData?.Seller?.FeedbackScore||itemData?.Seller?.FeedbackScore==0 )
  this.sellerInfoTable['FeedBack Score'] = itemData.Seller.FeedbackScore
  if(itemData?.Seller?.PositiveFeedbackPercent)
  this.sellerInfoTable['Popularity'] = itemData.Seller.PositiveFeedbackPercent
  console.log(feedbackscore,'check-scoree')
  
  if (feedbackscore >= 0 && feedbackscore <=9 )
  this.sellerInfoTable['Feedback Rating Star'] = 'N/A'
  else if (feedbackscore >=10000 )
  this.sellerInfoTable['Feedback Rating Star'] = 'stars'
  else
  this.sellerInfoTable['Feedback Rating Star'] = 'star_border'

  if ( itemData?.Seller &&  itemData.Seller.TopRatedSeller)
  this.sellerInfoTable['Top Rated'] = itemData.Seller.TopRatedSeller
  else
  this.sellerInfoTable['Top Rated'] = false
  if ( itemData?.Storefront &&  itemData?.Storefront?.StoreName)
  this.sellerInfoTable['Store Name'] =  itemData.Storefront.StoreName
  if ( itemData?.Storefront &&  itemData?.Storefront?.StoreURL)
  this.sellerInfoTable['Buy Product At'] = itemData.Storefront.StoreURL
  console.log(this.sellerInfoTable,'Seller Data')
}

onDetailsClick(){
  this.itemDetailsVisible=true
}




getItemInfo(itemId:any):Observable<any>  {
  var singleItemData = {
    params: {
      'item_id':itemId
    }
  }

  return this.http.get(`${this.serverBaseUrl}getSingleItem`,singleItemData);
}

truncateText(text: string): string {
 
  if (text.length > 35) {
    
    // Find the last index of a whitespace character before the cutoff point
    let lastWhitespaceIndex = text.lastIndexOf(' ', 35);
   
    // If the cutoff point is in the middle of a word, use the last whitespace index
    if (lastWhitespaceIndex > 35 / 2) {
      return text.slice(0, lastWhitespaceIndex) + '...';
    } else {
      return text.slice(0, 35) + '...';
    }
  }
  return text;
}

getPhotos(){
  this.callGoogleSearchEngine().subscribe((data)=>{
   this.photoTabLinks = data
    console.log(this.photoTabLinks,'Photo Tabs')
  })
}




backToResults():void{
  this.itemDetailsVisible=false
//   if(this.moreProducts)
//   this.moreProducts = []
// if(this.similarProductstable)
//   this.similarProductstable=[]
// this.singleItemTable = {}
// this.shippingItemTable={}
// this.sellerInfoTable = {}

  // this.photoTabLinks=[]
  // this.sellerInfoTable=[]
  // this.shippingItemTable=[]
}

callGoogleSearchEngine():Observable<any>  {
  var payloadData = {
    params: {
      'q':this.itemTitle
    }
  }

  return this.http.get(`${this.serverBaseUrl}searchEngine`,payloadData);

}

onSortByChange(event:any){
  if(event.target.value!=this.sortBy)
  {
    if(event.target.value!='Default')
    {
      this.sortOrderActive = false
   
    this.sortBy = event.target.value
    var similarProductsMerged = this.similarProductstable.concat(this.moreProducts)
    var data = this.sortItems(similarProductsMerged)
    this.similarProductstable = data.slice(0,5)
    this.moreProducts = data.slice(5,data.length)
    }
  else {
    this.sortOrderActive = true
    this.similarProductstable = this.preservedSortOrder.slice(0,5)
    this.moreProducts = this.preservedSortOrder.slice(5,this.preservedSortOrder.length)
  }
    
  }
  
  

}
sortItems(similarProductsMerged:any)
{
  for(let product of similarProductsMerged)
  {
    var val = product['timeLeft']
    product['days_left'] = product['timeLeft'].substr((val.indexOf('P')+1),(val.indexOf('D')-1))
  }

  if(this.sortBy == 'product_name' )
  {
    if(this.sortOrder == 'Ascending')
    {
      similarProductsMerged.sort((a:any,b:any)=> a['title'].localeCompare(b['title']))
      console.log(similarProductsMerged,'checkkkkk')
    }
    if(this.sortOrder == 'Descending')
    {
      similarProductsMerged.sort((a:any,b:any)=> b['title'].localeCompare(a['title']))
    }
   
  }

  if(this.sortBy=='price')
  {
    if(this.sortOrder == 'Ascending')
    {
      similarProductsMerged.sort((a:any,b:any)=> a['buyItNowPrice'].__value__.localeCompare(b['buyItNowPrice'].__value__))
      console.log(similarProductsMerged,'checkkkkk')
    }
    if(this.sortOrder == 'Descending')
    {
      similarProductsMerged.sort((a:any,b:any)=> b['buyItNowPrice'].__value__.localeCompare(a['buyItNowPrice'].__value__))
    }
  }

  if(this.sortBy == 'days_left')
  {
    if(this.sortOrder == 'Ascending')
    {
      similarProductsMerged.sort((a:any,b:any)=> a['days_left'].localeCompare(b['days_left']))
      console.log(similarProductsMerged,'checkkkkk')
    }
    if(this.sortOrder == 'Descending')
    {
      similarProductsMerged.sort((a:any,b:any)=> b['days_left'].localeCompare(a['days_left']))
    }
  }
  if(this.sortBy == 'shipping_cost')
  {
    if(this.sortOrder == 'Ascending')
    {
      similarProductsMerged.sort((a:any,b:any)=> a['shippingCost'].__value__.localeCompare(b['shippingCost'].__value__))
      console.log(similarProductsMerged,'checkkkkk')
    }
    if(this.sortOrder == 'Descending')
    {
      similarProductsMerged.sort((a:any,b:any)=> b['shippingCost'].__value__.localeCompare(a['shippingCost'].__value__))
    }
  }
  return similarProductsMerged
  

}


onSortOrderChange(event:any)
{
  if(event.target.value!=this.sortOrder)
  this.sortOrder = event.target.value
  var similarProductsMerged = this.similarProductstable.concat(this.moreProducts)
  var data = this.sortItems(similarProductsMerged)
  this.similarProductstable = data.slice(0,5)
  this.moreProducts = data.slice(5,data.length)
}

onTabSelect(event:any)
{
  
  if(this.showMoreActive)
  this.showMoreActive = false


 if(event.heading == 'Similar Products')
 {
  this.getSimilarProducts(this.selectedItemid)
 }

  
  
}









}




