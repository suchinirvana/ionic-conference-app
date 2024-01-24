import { Component } from '@angular/core';

import { PopoverController } from '@ionic/angular';

@Component({
  template: `
    <ion-list>
      <ion-item href="/app/tabs/content/terms-and-conditions">
        <ion-label>Terms & Conditions</ion-label>
      </ion-item>
      <ion-item  href="/app/tabs/content/privacy-policy">
        <ion-label>Privacy Policy</ion-label>
      </ion-item>
      <ion-item href="/app/tabs/content/refund-policy">
        <ion-label>Refund Policy</ion-label>
      </ion-item>
      <ion-item href="/app/tabs/support">
        <ion-label>Support</ion-label>
      </ion-item>
    </ion-list>
  `
})
export class PopoverPage {
  constructor(public popoverCtrl: PopoverController) {}

  support() {
    // this.app.getRootNavs()[0].push('/support');
    this.popoverCtrl.dismiss();
  }

  close(url: string) {
    window.open(url, '_blank');
    this.popoverCtrl.dismiss();
  }
}
