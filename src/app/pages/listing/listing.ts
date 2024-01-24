import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { PopoverController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverPage } from '../about-popover/about-popover';
import { LoadingController } from '@ionic/angular';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ModalController } from '@ionic/angular';
import { MyModalPage } from '../../modals/my-modal/my-modal.page';

@Component({
  selector: 'page-listing',
  templateUrl: 'listing.html',
  styleUrls: ['./listing.scss'],
})
export class ListingPage {
  location = 'madison';
  conferenceDate = '2047-05-17';
  listing = [];
  slug = '';
  title = '';
  message = '';
  user = [];
  comments = [];
  address = '';

  selectOptions = {
    header: 'Select a Location'
  };

  constructor(
    public popoverCtrl: PopoverController,
    public loadingController: LoadingController,
    public activatedRoute: ActivatedRoute,
    public jwtHelper: JwtHelperService,
    private storage: Storage,
    public modalController: ModalController,
  ) { }

  ngOnInit() {
    this.getData();
  }

  async openModal(location_id, user_id) {
      const modal = await this.modalController.create({
        component: MyModalPage,
        componentProps: {
          "place_address": this.address,
          "user_id": user_id,
          "location_id": location_id
        }
      });

      modal.onDidDismiss().then((dataReturned) => {
        if (dataReturned !== null) {
          //this.dataReturned = dataReturned.data;
          //alert('Modal Sent Data :'+ dataReturned);
        }
      });

      return await modal.present();
    }

  process(e) {
    const formData = {id : '', mode : '', user_id : ''};
    formData.id = e.target.dataset.id;
    formData.mode = e.target.title;
    
    this.storage.get('safealley_token').then((token) => {
        if(token){
            if (this.jwtHelper.isTokenExpired(token)) {
              
            }else{
              const decoded = this.jwtHelper.decodeToken(token);
              formData.user_id = decoded.data.user_id;

              if(e.target.title==="report"){
                this.openModal(e.target.dataset.id, decoded.data.user_id);
              }else{
                fetch('https://www.mysafealley.com/api/listings/process', {
                  method: 'POST',
                  body: JSON.stringify(formData),
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
                  }
                })
                .then(res=> res.json())
                .then(res => {
                  this.dismissLoader();
                  if(res.status==="success") {
                    
                  } else {
                    
                    throw res.message;
                    
                  }
                })
                .catch(err => {
                    this.message = err;
                   // this.presentToast();
                });
              }

              
            }
        }
    });

    
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: this.message,
      duration: 3000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
  }

  async dismissLoader() {
      await this.loadingController.dismiss()
      .then(()=>{
        
      })
      .catch(e => console.log(e));
  }


  getData(){
      this.message = "Loading...";
      this.presentLoading();

      this.slug = this.activatedRoute.snapshot.paramMap.get('id');

      fetch('https://www.mysafealley.com/api/listings/view/id/'+this.slug, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
        }
      })
      .then(res => res.json())
      .then(res => {
          this.listing = res.data.listing;
          this.user = res.data.user;
          this.comments = res.data.comments;
          this.address = res.data.listing.address;
          this.dismissLoader();
      });
  }


  async presentPopover(event: Event) {
    const popover = await this.popoverCtrl.create({
      component: PopoverPage,
      event
    });
    await popover.present();
  }
}
