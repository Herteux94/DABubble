import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ActiveUserService {

  constructor() { }

  activeUser = 'userID Platzhalter' // nach dem Login muss hier der aktive User gespeichert werden
}
