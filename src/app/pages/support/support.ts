import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AlertController, ToastController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { PopoverPage } from '../about-popover/about-popover';


@Component({
  selector: 'page-support',
  templateUrl: 'support.html',
  styleUrls: ['./support.scss'],
})
export class SupportPage {
  submitted = false;
  supportMessage: string;
  supportUsername: string;
  supportEmail : string;
  supportContact : string;

  constructor(
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public popoverCtrl: PopoverController,
  ) { }

  ionViewWillEnter() {
    this.submitted = false;
  }


  async presentPopover(event: Event) {
    const popover = await this.popoverCtrl.create({
      component: PopoverPage,
      event
    });
    await popover.present();
  }

  async ionViewDidEnter() {
    /*const toast = await this.toastCtrl.create({
      message: 'This does not actually send a support request.',
      duration: 3000
    });
    await toast.present();*/
  }

  async submit(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      this.supportMessage = '';
      this.supportUsername = '';
      this.supportEmail = '';
      this.supportContact = '';
      this.submitted = false;

      const toast = await this.toastCtrl.create({
        message: 'Thank you for contacting with us. We will get back to you soon.',
        duration: 3000
      });
      await toast.present();
    }
  }


}
