import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { first, map, Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { User } from '../models/user.model';
import { ActiveUserService } from './active-user.service';
import { FindUserService } from './find-user.service';

@Injectable({
  providedIn: 'root',
})
export class ActiveDirectMessageService {
  activeDM: any;
  dmMessages$!: Observable<any[]>;
  dmMessages: Message[] = [];

  activeDMPartner!: any;

  constructor(
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService,
    private findUserService: FindUserService
  ) {}

  async loadActiveDMAndMessagesAndPartner(directMessageID: string) {
    await this.loadActiveDM(directMessageID);
    this.loadDMMessages(directMessageID);
    setTimeout(() => {
      console.log('aktive DM: ', this.activeDM);
      console.log('aktive DM-Nachrichten: ', this.dmMessages);
    }, 1000)
  }

  async loadActiveDM(directMessageID: string): Promise<void> {
    this.firestoreService.allDirectMessages$
      .pipe(
        first(directMessages => directMessages.some(directMessage => directMessage.directMessageID === directMessageID)),
        map(directMessages => directMessages.find(directMessage => directMessage.directMessageID === directMessageID))
      )
      .subscribe({
        next: (directMessage) => {
          if (directMessage) {
            this.activeDM = directMessage; 
          } else {
            console.error('DirectMessage nicht gefunden');
          }
        },
        error: (error) => {
          console.error('Fehler beim Laden der aktiven DirectMessage:', error);
        }
      });      
  }

  loadDMMessages(directMessageID: string) {
    this.dmMessages$ = this.firestoreService.getMessages('directMessages', directMessageID);
    this.dmMessages$.subscribe({
      next: (messages) => {
        if (messages) {          
          this.dmMessages = messages.sort((a, b) => a.creationTime - b.creationTime); 
        } else {
          console.error('Messages nicht gefunden');
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der aktiven Messages:', error);
      }
    });      
  }

  // async loadDMPartner() {
  //     let activeUserID = this.activeUserService.activeUser.userID;
  //     let dmPartnerID = await this.activeDM.member.find((memberID: string) => memberID !== activeUserID);

  //     this.activeDMPartner = this.findUserService.findUser(dmPartnerID);

  //     console.log('DM Partner: ', this.activeDMPartner);
  //   }
  


}
