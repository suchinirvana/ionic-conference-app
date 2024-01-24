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
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'page-editprofile',
  templateUrl: 'editprofile.html',
  styleUrls: ['./editprofile.scss'],
})
export class EditprofilePage {
  login: UserOptions = { first_name: '', last_name: '', city : '', username: '', email_address : '', contact_number : '', password: '', country: '' };
  submitted = false;
  message : string = null;
  profile = { id: '', first_name: '', last_name: '', city : '', contact_number : '', address: '' };

  constructor(
    public userData: UserData,
    private storage: Storage,
    public router: Router,
    public jwtHelper: JwtHelperService,
    public toastController: ToastController,
    public alertController: AlertController,
    public loadingController: LoadingController
  ) { }

  ionViewDidEnter() {
    //this.getUsername();
    this.getData();
  }

  getData(){
      this.message = 'Loading...';
      this.presentLoading();
      const ret = this.storage.get('safealley_token');
      this.storage.get('safealley_token').then((token) => {
        if(token){
            if (this.jwtHelper.isTokenExpired(token)) {
              this.message = 'Unauthorized: Please login again';
              this.presentToast();
            }else{
              const decoded = this.jwtHelper.decodeToken(token);
              fetch('https://www.mysafealley.com/api/users/?email_address='+decoded.data.email, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
                }
              })
              .then(res => res.json())
              .then(res => {
                    this.profile.first_name = res.data[0].first_name;
                    this.profile.last_name = res.data[0].last_name;
                    this.profile.contact_number = res.data[0].contact_number;
                    this.profile.address = res.data[0].address;
                    this.profile.city = res.data[0].city;
                    this.profile.id = res.data[0].id;
                    this.dismissLoader();
                  }
              );
            }
        }else{
          //this.props.history.push('/');
          this.message = 'Unauthorized: Please login';
          this.presentToast();
          this.router.navigateByUrl('/app/tabs/login');
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

  onUpdateProfile(form: NgForm) {
    this.submitted = true;
    if (form.valid) {
      fetch('https://www.mysafealley.com/api/users', {
        method: 'POST',
        body: JSON.stringify(this.profile),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
        }
      })
      .then(res=> res.json())
      .then(res => {
        this.dismissLoader();
        if(res.status==="success") {
          this.message = res.message;
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
