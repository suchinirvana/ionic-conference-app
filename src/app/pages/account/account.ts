import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UserData } from '../../providers/user-data';
import { Storage } from '@ionic/storage';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
  styleUrls: ['./account.scss'],
})


export class AccountPage implements AfterViewInit {
  username: string;
  email: string;
  phone: string;
  plan_selected: string;
  end_date: string;
  start_date: string;
  message : string = null;
  isLoggedIn : boolean;
  imgs : '';
  
  constructor(
    public alertCtrl: AlertController,
    public router: Router,
    public userData: UserData,
    private storage: Storage,
    public jwtHelper: JwtHelperService,
    public toastController: ToastController,
    public alertController: AlertController,
    public loadingController: LoadingController
  ) { }

  ngAfterViewInit() {
    this.getUsername();
    //this.getData();
    this.userData.isLoggedIn().then(loggedIn => {
      if(!loggedIn){
        
        this.router.navigateByUrl('/app/tabs/login');
      }else{
        this.isLoggedIn = loggedIn;
        this.userData.setUsername(this.username);
      }
    });
  }

  ionViewDidEnter() {
  //alert('sd')
    this.userData.isLoggedIn().then(loggedIn => {
      if(!loggedIn){
        this.router.navigateByUrl('/app/tabs/login');
      }else{
        this.isLoggedIn = loggedIn;
        this.userData.setUsername(this.username);
      }
    });
  }

  ngOnInit() {
    this.getData();
  }

  doRefresh(event) {
      setTimeout(() => {
        this.getData();
        event.target.complete();
      }, 2000);
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
      header: 'Deactivate Account',
      subHeader: '',
      message: this.message,
      buttons: ['Cancel','Proceed']
    });

    await alert.present();
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: this.message,
      duration: 2000
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
      this.message = "Loading..."
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
                    this.username = res.data[0].user_name;
                    this.email = res.data[0].email_address;
                    this.phone = res.data[0].contact_number;
                    this.imgs = res.data[0].user_image_url;
                    this.userData.setUsername(res.data[0].user_name);
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

  updatePicture() {
  }

  // Present an alert with the current username populated
  // clicking OK will update the username and display it
  // clicking Cancel will close the alert and do nothing
  async changeUsername() {
    const alert = await this.alertCtrl.create({
      header: 'Change Username',
      buttons: [
        'Cancel',
        {
          text: 'Ok',
          handler: (data: any) => {
            this.userData.setUsername(data.username);
            this.getUsername();
          }
        }
      ],
      inputs: [
        {
          type: 'text',
          name: 'username',
          value: this.username,
          placeholder: 'username'
        }
      ]
    });
    await alert.present();
  }

  getUsername() {
    this.userData.getUsername().then((username) => {
      this.username = username;
    });
  }

  changePassword() {
    
  }

  logout() {
    this.userData.logout();
    this.router.navigateByUrl('/login');
  }

  support() {
    this.router.navigateByUrl('/support');
  }

  deactivateAccount(){
    this.message = 'Deactivating your account will remove all your data from the website. Are you sure to proceed?';
    this.presentAlertConfirm();
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm!',
      message: this.message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            
          }
        }, {
          text: 'Okay',
          handler: () => {
             this.message = "Processing..."
             this.presentLoading();
            this.storage.get('safealley_token').then((token) => {
              if(token){
                  if (this.jwtHelper.isTokenExpired(token)) {
                    this.message = 'Unauthorized: Please login again';
                    this.presentToast();
                  }else{
                    const decoded = this.jwtHelper.decodeToken(token);
                    fetch('https://www.mysafealley.com/api/users/deleteAccount/user_id/'+decoded.data.user_id, {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
                      }
                    })
                    .then(res=> res.json())
                    .then(res => {
                      this.dismissLoader();
                      if(res.status==="success") {
                        this.userData.logout().then(() => {
                            this.storage.set('safealley_token', '');
                            this.storage.set('safealley_user', '');
                            this.router.navigateByUrl('/app/tabs/map');
                        });
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
            });

          }
        }
      ]
    });

    await alert.present();
  }
}
