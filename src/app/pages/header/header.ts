import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'page-header',
  templateUrl: 'header.html',
  styleUrls: ['./header.scss'],
})
export class HeaderPage implements OnInit {
  countries : [];
  selectedCountry : 'CA'

  constructor(
    private storage: Storage,
    private router: Router
  ) { }

  ngOnInit() {

    this.storage.get('safealley_country').then((country) => {
        if(country){
          this.selectedCountry = country;
        }else{
          this.selectedCountry = 'CA';
        }
    });

    fetch('https://www.mysafealley.com/api/resources/?type=country', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
        }
      })
      .then(res=> res.json())
      .then(res => {
        this.countries = res.data.country;
      })
      .catch(err => {
          
      });
  }

  onChange(e){
    this.storage.set('safealley_country', e.target.value);
    console.log('this.router.url', this.router.url);
    if(this.router.url=='/app/tabs/signup'){
      window.location.reload();
    }
  }

  
}
