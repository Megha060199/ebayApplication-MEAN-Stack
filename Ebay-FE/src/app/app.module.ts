import { NgModule,Renderer2, RendererFactory2 } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { SearchResultsComponent } from './search-results/search-results.component';
import { MatIconModule} from '@angular/material/icon';
import {NgxPaginationModule} from 'ngx-pagination';
import { ModalContentComponent } from './modal-content/modal-content.component';
import { ModalModule,BsModalService,BsModalRef } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { TabsModule} from 'ngx-bootstrap/tabs'
import { NgCircleProgressModule } from 'ng-circle-progress';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    AppComponent,
    SearchResultsComponent,
    ModalContentComponent,
    

  ],
  imports: [
  
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatIconModule,
    NgxPaginationModule,
    ModalModule.forRoot(),
    ModalModule.forChild(),
    TabsModule,
    NgCircleProgressModule.forRoot(
      {
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 300,
      maxPercent:100
    }),
    TooltipModule


 
   
   
    
  
    

  
   
  ],
  providers: [BsModalRef],
  bootstrap: [AppComponent]
})
export class AppModule { }
