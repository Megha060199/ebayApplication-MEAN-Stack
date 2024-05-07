import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { BsModalService,BsModalRef,ModalOptions   } from 'ngx-bootstrap/modal';




@Component({
  selector: 'app-modal-content',
  templateUrl: './modal-content.component.html',
  styleUrls: ['./modal-content.component.scss']
})

@Injectable({
  providedIn: 'root',
})
export class ModalContentComponent {
 

  
  modalRef?: BsModalRef;
  pictureURL = []
  constructor(public modalService: BsModalService) {
  }
  slideConfig = {"slidesToShow": 1, "slidesToScroll": 1};
  
  

  ngOnInit(){
    
  }



  trackByFn(slide:any) {
    return slide
  }
  
  openModal(pictureURL: never[]) {
    const modalOptions: ModalOptions<ModalContentComponent> = {
      initialState: 
      { 
        'pictureURL': pictureURL 
      }
    };
console.log(pictureURL,'checkkkk')
    this.modalRef = this.modalService.show(ModalContentComponent,modalOptions);
    
  }

  closeModal()
  {
    this.modalService.hide()
  }

 
    
  
  }

