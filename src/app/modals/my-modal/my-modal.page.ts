import { Component, OnInit } from '@angular/core';
import { 
ModalController, 
ToastController,
NavParams 
} from '@ionic/angular';

@Component({
  selector: 'app-my-modal',
  templateUrl: './my-modal.page.html',
  styleUrls: ['./my-modal.page.scss'],
})
export class MyModalPage implements OnInit {

  activity = { address : '', user_id : '', location_id : '', description : '' };
  modalTitle: string;
  modelId: number;
  submitted = false;
  message = '';
  date = new Date();

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    public toastController: ToastController,
  ) { }

  ngOnInit() {
    console.table(this.navParams);
    this.modelId = this.navParams.data.latitude;
    this.modalTitle = this.navParams.data.place_address;
    this.activity.address = this.navParams.data.place_address;
    this.activity.user_id = this.navParams.data.user_id;
    this.activity.location_id = this.navParams.data.location_id;
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: this.message,
      duration: 2000
    });
    toast.present();
  }

  async closeModal() {
    const onClosedData: string = "Wrapped Up!";
    await this.modalController.dismiss(onClosedData);
  }

  onUpdateProfile(e){
    this.submitted = true;
    console.log(this.activity);
    fetch('https://www.mysafealley.com/api/listings/report', {
        method: 'POST',
        body: JSON.stringify(this.activity),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
        }
      })
      .then(res=> res.json())
      .then(res => {
        //this.dismissLoader();
        console.log(res)
        if(res.status==="success") {
          this.message = res.message;
          this.presentToast();
          this.closeModal();
        } else {
          throw res.message;
        }
      })
      .catch(err => {
          this.message = err;
          this.presentToast();
      });
  }

}