import { Component } from '@angular/core';
import { UserData } from '../../providers/user-data';

@Component({
  templateUrl: 'tabs-page.html'
})
export class TabsPage {
  isLoggedIn : boolean;

  constructor(
    public userData: UserData
  ) { }

  ionViewWillEnter() {
    this.getData();
  }

  ngAfterViewInit() {
    this.getData();
  }
  
  ngOnInit() {
    this.getData();
  }

  getData(){
  	this.userData.isLoggedIn().then((isLoggedIn) => {
  		this.isLoggedIn = isLoggedIn;
  	});
  }

}
