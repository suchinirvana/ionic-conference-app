import { Component, OnInit, ViewEncapsulation, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';

import { MenuController, Platform, ToastController, IonRouterOutlet, AlertController  } from '@ionic/angular';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Storage } from '@ionic/storage';

import { UserData } from './providers/user-data';
import {Location} from '@angular/common';
import { FirebaseX } from "@ionic-native/firebase-x/ngx";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList < IonRouterOutlet > ;

  lastTimeBackPress = 0;
  timePeriodToExit = 2000;

  appPages = [
    {
      title: 'Home',
      url: '/app/tabs/map',
      icon: 'home'
    },
    {
      title: 'Explore',
      url: '/app/tabs/search',
      icon: 'search'
    },
    {
      title: 'How It Works',
      url: '/app/tabs/about',
      icon: 'information-circle'
    },
    {
      title: 'Contact Us',
      url: '/app/tabs/support',
      icon: 'headset'
    },
    {
      title: 'Privacy Policy',
      url: '/app/tabs/content/privacy-policy',
      icon: 'book'
    },
    {
      title: 'Terms & Conditions',
      url: '/app/tabs/content/terms-and-conditions',
      icon: 'book'
    }
  ];
  loggedIn = false;
  dark = false;

  constructor(
    private menu: MenuController,
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: Storage,
    private userData: UserData,
    private swUpdate: SwUpdate,
    private toastCtrl: ToastController,
    private alertController: AlertController,
    private location: Location,
    private firebaseX: FirebaseX
  ) {
    this.initializeApp();
  }

  async ngOnInit() {
    this.checkLoginStatus();
    this.listenForLoginEvents();

    this.swUpdate.available.subscribe(async res => {
      const toast = await this.toastCtrl.create({
        message: 'Update available!',
        position: 'bottom',
        buttons: [
          {
            role: 'cancel',
            text: 'Reload'
          }
        ]
      });

      await toast.present();

      toast
        .onDidDismiss()
        .then(() => this.swUpdate.activateUpdate())
        .then(() => window.location.reload());
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.backButtonEvent();

      this.firebaseX.getToken()
        .then(token => console.log(`The token is ${token}`))
        .catch(error => console.error('Error getting token', error));

      this.firebaseX.onMessageReceived()
        .subscribe(data => console.log(`User opened a notification ${data}`));

      this.firebaseX.onTokenRefresh()
        .subscribe((token: string) => console.log(`Got a new token ${token}`));
        
    });
  }

  backButtonEvent() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.routerOutlets.forEach(async(outlet: IonRouterOutlet) => {
        if (this.router.url != '/' && this.router.url != '/map' && this.router.url != '/tabs/map' && this.router.url != '/app/tabs/map') {
          // await this.router.navigate(['/']);
          await this.location.back();
        } else if (this.router.url === '/' || this.router.url === '/map' || this.router.url === '/tabs/map' || this.router.url === '/app/tabs/map') {
          if (new Date().getTime() - this.lastTimeBackPress >= this.timePeriodToExit) {
            this.lastTimeBackPress = new Date().getTime();
            this.presentAlertConfirm();
          } else {
            navigator['app'].exitApp();
          }
        }
      });
    });
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      // header: 'Confirm!',
      message: 'Are you sure you want to exit the app?',
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: (blah) => {}
      }, {
        text: 'Close App',
        handler: () => {
          navigator['app'].exitApp();
        }
      }]
    });
  
    await alert.present();
  }

  checkLoginStatus() {
    return this.userData.isLoggedIn().then(loggedIn => {
      return this.updateLoggedInStatus(loggedIn);
    });
  }

  updateLoggedInStatus(loggedIn: boolean) {
    setTimeout(() => {
      this.loggedIn = loggedIn;
    }, 300);
  }

  listenForLoginEvents() {
    window.addEventListener('user:login', () => {
      this.updateLoggedInStatus(true);
    });

    window.addEventListener('user:signup', () => {
      this.updateLoggedInStatus(true);
    });

    window.addEventListener('user:logout', () => {
      this.updateLoggedInStatus(false);
    });
  }

  logout() {
    this.userData.logout().then(() => {
      return this.router.navigateByUrl('/app/tabs/map');
    });
  }

  openTutorial() {
    this.menu.enable(true);
    this.storage.set('ion_did_tutorial', true);
    this.router.navigateByUrl('/tutorial');
  }
}
