import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThreadServiceService {

  threadOpen: boolean = false;

  constructor() { }

  closeThread() {
    this.threadOpen = false;
  }

  openThread() {
    if(!this.threadOpen) {
      this.threadOpen = true;
    }
  }

}
