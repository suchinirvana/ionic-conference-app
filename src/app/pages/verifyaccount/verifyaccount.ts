import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserData } from '../../providers/user-data';

import { UserOptions } from '../../interfaces/user-options';
import { Storage } from '@ionic/storage';
import { Device } from '@ionic-native/device';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'page-verifyaccount',
  templateUrl: 'verifyaccount.html',
  styleUrls: ['./verifyaccount.scss'],
})
export class VerifyaccountPage {
  submitted = false;
  message : string = null;
  slug = '';
  email_address = '';
  contact_number = '';
  selectedRadioGroup = 'Mobile';
  code_received = 0;
  verification_code = '';
  login = { code : ''}

  constructor(
    public userData: UserData,
    private storage: Storage,
    public router: Router,
    public jwtHelper: JwtHelperService,
    public toastController: ToastController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public activatedRoute: ActivatedRoute
  ) { }

  ionViewDidEnter() {
    //this.getUsername();
    this.getData();
  }

  getData(){
      this.slug = this.activatedRoute.snapshot.paramMap.get('id');
      this.message = 'Loading...';
      this.presentLoading();
      fetch('https://www.mysafealley.com/api/users/?id='+this.slug, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
        }
      })
      .then(res => res.json())
      .then(res => {
            this.email_address = res.data[0].email_address;
            this.contact_number = res.data[0].contact_number;
            this.dismissLoader();
          }
      );
  }


   async presentToast() {
    const toast = await this.toastController.create({
      message: this.message,
      duration: 2000
    });
    toast.present();
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

  radioGroupChange(event) {
    this.selectedRadioGroup = event.detail.value;
  }

  onVerify(form: NgForm) {
    this.submitted = true;
    if (form.valid) {
      fetch('https://www.mysafealley.com/api/users/verifyCode', {
        method: 'POST',
        body: JSON.stringify({'id' : this.slug, 'verification_code' : this.login.code}),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
        }
      })
      .then(res=> res.json())
      .then(res => {
        this.dismissLoader();
        this.submitted = false;
        if(res.status==="success") {
          this.storage.set('safealley_token', res.token);
          this.storage.set('safealley_user', res.data.username);
          var username = res.data.username;
          this.userData.login(username);
          this.message = "Welcome "+username;
          this.presentToast();
          this.router.navigateByUrl('/app/tabs/map');
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

  sendCode(){
    fetch('https://www.mysafealley.com/api/users/verifyAccount', {
        method: 'POST',
        body: JSON.stringify({'id' : this.slug, 'verification_type' : this.selectedRadioGroup}),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
        }
      })
      .then(res=> res.json())
      .then(res => {
        this.dismissLoader();
        this.submitted = false;
        if(res.message==="code sent") {
          this.message = "Please check your "+this.selectedRadioGroup+" for the code";
          this.presentToast();
        } else {
          throw res.message;
        }
      })
      .catch(err => {
          this.message = err;
          this.presentToast();
      });
  }

  onUpdateProfile(form: NgForm) {
    this.submitted = true;
    if (form.valid) {
      fetch('https://www.mysafealley.com/api/users/verifyAccount', {
        method: 'POST',
        body: JSON.stringify({'id' : this.slug, 'verification_type' : this.selectedRadioGroup}),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
        }
      })
      .then(res=> res.json())
      .then(res => {
        this.dismissLoader();
        this.submitted = false;
        if(res.message==="code sent") {
          this.code_received = 1;
          this.message = "Enter the code";
          this.presentToast();
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

  onSignup() {
    this.router.navigateByUrl('/signup');
  }
}
