import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToggleMobileComponentsService {

  showNavOnMobile: boolean = true;
  showMessageOnMobile: boolean = false;
  showThreadOnMobile: boolean = false;

  constructor() { }

  showNavCom() {
    this.showNavOnMobile = true;
    this.showThreadOnMobile = false;
    this.showMessageOnMobile = false;
  }

  showMessageCom() {
    this.showNavOnMobile = false;
    this.showThreadOnMobile = false;
    this.showMessageOnMobile = true;
  }

  showThreadCom() {
    this.showNavOnMobile = false;
    this.showMessageOnMobile = false;
    this.showThreadOnMobile = true;
  }
}
