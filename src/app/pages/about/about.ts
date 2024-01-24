import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { PopoverPage } from '../about-popover/about-popover';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
  styleUrls: ['./about.scss'],
})
export class AboutPage {
  location = 'madison';
  conferenceDate = '2047-05-17';
  content = '';
  message = '';

  selectOptions = {
    header: 'Select a Location'
  };

  constructor(
    public popoverCtrl: PopoverController,
    public loadingController: LoadingController
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
      fetch('https://www.mysafealley.com/api/content/slug/how-it-works', {
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
