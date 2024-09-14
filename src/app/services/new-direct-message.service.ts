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

  /**
   * Constructor for the NewDirectMessageService.
   *
   * Injects the FirestoreService and ActiveUserService.
   * @param firestoreService Injected service to interact with Firestore.
   * @param activeUserService Injected service to get the currently active user.
   */
  constructor(
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService
  ) {}

  /**
   * Returns the user who will receive the new direct message.
   * @returns The user who will receive the new direct message.
   */
  getNewMessageSender() {
    return this.messageReceiver;
  }

  /**
   * Creates a new direct message and adds it to the Firestore database.
   *
   * Creates a new DirectMessage object and adds it to the Firestore database.
   * The message is added to the directMessages collection with the given
   * user ID and the ID of the user who is the receiver of the message.
   * @returns A Promise that resolves to the ID of the newly added direct message.
   */
  addNewDirectMessage(): Promise<string> {
    const sender = this.messageReceiver;
    const user = this.activeUserService.activeUser;
    const newDirectMessage = new DirectMessage();
    newDirectMessage.directMessageID = '';
    newDirectMessage.member = [user.userID, sender.userID];
    return this.firestoreService
      .addDirectMessage(newDirectMessage.toJSON(), user.userID, sender.userID)
      .then((docRef) => {
        return docRef.id;
      })
      .catch((error) => {
        console.error('Unable to create new direct message:', error);
        throw error;
      });
  }
}
