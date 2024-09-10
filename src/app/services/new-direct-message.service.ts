import { Injectable } from '@angular/core';
import { ActiveUserService } from './active-user.service';
import { FirestoreService } from './firestore.service';
import { User } from '../models/user.model';
import { DirectMessage } from '../models/directMessages.model';

@Injectable({
  providedIn: 'root',
})
export class NewDirectMessageService {
  messageReceiver!: User;

  constructor(
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService
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

    return this.firestoreService
      .addDirectMessage(newDirectMessage.toJSON(), user.userID, sender.userID)
      .then((docRef) => {
        return docRef.id;
      })
      .catch((error) => {
        console.error('Fehler beim Erstellen des Channels:', error);
        throw error;
      });
  }
}
