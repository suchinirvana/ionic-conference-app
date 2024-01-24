import { Component } from '@angular/core';

import { PopoverController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverPage } from '../about-popover/about-popover';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'page-content',
  templateUrl: 'content.html',
  styleUrls: ['./content.scss'],
})
export class ContentPage {
  location = 'madison';
  conferenceDate = '2047-05-17';
  content = '';
  slug = '';
  title = '';
  message = '';

  selectOptions = {
    header: 'Select a Location'
  };

  constructor(
    public popoverCtrl: PopoverController,
    public loadingController: LoadingController,
    public activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getData();
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: this.message,
      duration: 5000
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

      fetch('https://www.mysafealley.com/api/content/slug/'+this.slug, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
        }
      })
      .then(res => res.json())
      .then(res => {
        this.dismissLoader();
        this.content = res.page_content;
        this.title = res.page_title;
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
