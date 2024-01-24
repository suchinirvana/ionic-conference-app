import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { UserData } from '../../providers/user-data';

import { UserOptions } from '../../interfaces/user-options';
import { Storage } from '@ionic/storage';
import { Device } from '@ionic-native/device';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage {
  login: UserOptions = { username: '', email_address : '', contact_number : '', password: '', first_name:'', last_name:'', city:'', country : '' };
  submitted = false;
  message : string = null;
  isLoggedIn = false;
  users = { id: '', name: '', email: '', picture: { data: { url: '' } } };

  constructor(
    public userData: UserData,
    private storage: Storage,
    public router: Router,
    public toastController: ToastController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private fb: Facebook
  ) { 

      fb.getLoginStatus()
      .then(res => {
        if (res.status === 'connect') {
          this.isLoggedIn = true;
        } else {
          this.isLoggedIn = false;
        }
      })
      .catch(e => console.log(e));
  }

  ionViewDidEnter() {
    //this.getUsername();
    //this.getData();
  }

  fbLogin() {
    this.fb.login(['public_profile', 'user_friends', 'email'])
      .then(res => {
        if (res.status === 'connected') {
          this.isLoggedIn = true;
          this.getUserDetail(res.authResponse.userID);
        } else {
          this.isLoggedIn = false;
        }
      })
      .catch(e => console.log('Error logging into Facebook', e));
  }

  getUserDetail(userid: any) {
    this.fb.api('/' + userid + '/?fields=id,email,name,picture', ['public_profile'])
      .then(res => {
        console.log(res);
        this.users = res;
      })
      .catch(e => {
        console.log(e);
      });
  }

  async ionViewWillEnter() {
    this.submitted = false;
    this.login = {username:'',first_name:'',last_name :'',email_address : '',contact_number : '',password: '',city : '',country : '' };
    this.userData.isLoggedIn().then(loggedIn => {
      if(!loggedIn){
        //this.router.navigateByUrl('/app/tabs/login');
      }else{
        this.router.navigateByUrl('/app/tabs/account');
      }
    });
  }

   async presentToast() {
    const toast = await this.toastController.create({
      message: this.message,
      duration: 2000
    });
    toast.present();
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'New Device Detected',
      subHeader: '',
      message: this.message,
      buttons: ['Okay']
    });

    await alert.present();
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Verifying details...',
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

  onLogin(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      this.presentLoading();
      const formData = { email_address : '', password : ''};
      formData.email_address = this.login.username;
      formData.password = this.login.password;

      fetch('https://www.mysafealley.com/api/users/login', {
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
          this.storage.set('safealley_token', res.token);
          this.storage.set('safealley_user', res.data.username);
          var username = res.data.username;
          this.userData.login(username);
          this.message = "Welcome back "+username;
          this.presentToast();
          this.router.navigateByUrl('/app/tabs/map');
        } else {
          if(res.message=='Please verify your account'){
            this.message = res.message;
            this.presentToast();
            this.router.navigateByUrl('/app/tabs/verify-account/'+res.data);
          }else{
              throw res.message;
          }
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
