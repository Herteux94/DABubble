import { Injectable } from '@angular/core';
import { ActiveUserService } from './active-user.service';
import { FirestoreService } from './firestore.service';
import { User } from '../models/user.model';
import { DirectMessage } from '../models/directMessages.model';
import { log } from 'console';
import { ActiveDirectMessageService } from './active-direct-message-service.service';

@Injectable({
  providedIn: 'root',
})
export class NewDirectMessageService {
  messageReceiver!: User;

  constructor(
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService,
    private activeDirectMessageService: ActiveDirectMessageService,
  ) {}

  getNewMessageSender() {
    return this.messageReceiver;
  }

  addNewDirectMessage(): Promise<string> {
    const sender = this.messageReceiver;
    const user = this.activeUserService.activeUser;
    console.log(sender, user);

    const newDirectMessage = new DirectMessage();
    newDirectMessage.directMessageID = '';
    newDirectMessage.member = [user.userID, sender.userID];

    // Da du die Funktion asynchron machst, musst du das Ergebnis des Promise zurückgeben.
    return this.firestoreService
      .addDirectMessage(newDirectMessage.toJSON(), user.userID, sender.userID)
      .then((docRef) => {
        // Hier wird die docRef.id zurückgegeben.
        return docRef.id;
      })
      .catch((error) => {
        console.error('Fehler beim Erstellen des Channels:', error);
        // Optional: Fehlerbehandlung durch Rückgabe eines spezifischen Werts oder Neuwerfen des Fehlers
        throw error;
      });

      // this.activeDirectMessageService.loadActiveThreadAndMessages(threadMessageID: string)
  }

  // addNewDirectMessage() {
  //   const sender = this.messageReceiver;
  //   const user = this.activeUserService.activeUser;
  //   console.log(sender, user);
  //   const newDirectMessage = new DirectMessage();
  //   newDirectMessage.directMessageID = '';
  //   newDirectMessage.member = [this.activeUserService.activeUser.userID, sender.userID];
  //   try {
  //     this.firestoreService.addDirectMessage(newDirectMessage.toJSON(),this.activeUserService.activeUser.userID).then((docRef) => {
  //       return docRef.id;
  //     })
  //     ;
  //     // this.firestoreService.updateUserWithChannelOrDirectMessage(user.userID,'directMessages',this.id)
  //   } catch (error) {
  //     console.error('Fehler beim Erstellen des Channels:', error);
  //   }
  // }
}
