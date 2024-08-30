import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  setDoc,
  getDoc,
  DocumentReference,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel.model';
import { User } from '../models/user.model';
import { DirectMessage } from '../models/directMessages.model';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  userCol = collection(this.firestore, 'users');
  channelCol = collection(this.firestore, 'channels');
  directMessageCol = collection(this.firestore, 'directMessages');

  allUsers$!: Observable<User[]>;
  allChannels$!: Observable<Channel[]>;
  allDirectMessages$!: Observable<DirectMessage[]>;
  allThreads$!: Observable<any[]>;

  allUsers: User[] = [];
  allChannels: Channel[] = [];
  allDirectMessages: DirectMessage[] = [];

  constructor(private firestore: Firestore) {
    this.loadUserList();
    this.loadChannelList();
    this.loadDirectMessageList();
  }

  ///////////////////////////////////////// loadFunctions /////////////////////////////////////////

  loadUserList() {
    this.allUsers$ = this.getUsers();
    this.allUsers$.subscribe((users) => {
      this.allUsers = users;
    });
  }

  getUsers(): Observable<any[]> {
    return collectionData(this.userCol);
  }

  loadChannelList() {
    this.allChannels$ = this.getChannels();
    this.allChannels$.subscribe((channels) => {
      this.allChannels = channels;
    });
  }

  getChannels(): Observable<any[]> {
    return collectionData(this.channelCol);
  }

  loadDirectMessageList() {
    this.allDirectMessages$ = this.getDirectMessages();
    this.allDirectMessages$.subscribe((directMessages) => {
      this.allDirectMessages = directMessages;
    });
  }

  getDirectMessages(): Observable<any[]> {
    return collectionData(this.directMessageCol);
  }

  getThread(channelID: string, threadMessageID: string) {
    return getDoc(
      doc(this.firestore, `channels/${channelID}/messages/${threadMessageID}`)
    );
  }

  getMessages(messengerType: string, messengerID: string): Observable<any[]> {
    return collectionData(
      collection(this.firestore, `${messengerType}/${messengerID}/messages`)
    );
  }

  getThreadMessages(
    channelID: string,
    threadMessageID: string
  ): Observable<any[]> {
    return collectionData(
      collection(
        this.firestore,
        `channels/${channelID}/messages/${threadMessageID}/threadMessages`
      )
    );
  }

  ///////////////////////////////////////// addFunctions /////////////////////////////////////////

  async addUser(userData: any) {
    const userRef = doc(this.firestore, `users/${userData.userID}`);
    setDoc(userRef, userData);
  }

  addChannel(channelData: any, userID: string) {
    addDoc(this.channelCol, channelData).then((docRef) => {
      updateDoc(doc(this.channelCol, docRef.id), {
        channelID: docRef.id,
      });
      this.updateUserWithChannelOrDirectMessage(userID, 'channels', docRef.id);
    });
  }

  addDirectMessage(directMessageData: any, userID: string): Promise<DocumentReference> {
    return addDoc(this.directMessageCol, directMessageData).then((docRef) => {
      updateDoc(doc(this.directMessageCol, docRef.id), {
        directMessageID: docRef.id,
      });
      this.updateUserWithChannelOrDirectMessage(
        userID,
        'directMessages',
        docRef.id
      );
      return docRef;
    });
  }

  // addDirectMessage(directMessageData: any, userID: string) {
  //   return addDoc(this.directMessageCol, directMessageData).then((docRef) => {
  //     updateDoc(doc(this.directMessageCol, docRef.id), {
  //       directMessageID: docRef.id,
  //     });
  //     this.updateUserWithChannelOrDirectMessage(
  //       userID,
  //       'directMessages',
  //       docRef.id
  //     );
  //   });
  // }

  addMessage(messageData: any, messengerType: string, messengerID: string) {
    addDoc(
      collection(this.firestore, `${messengerType}/${messengerID}/messages`),
      messageData
    ).then((docRef: any) => {
      updateDoc(
        doc(
          collection(
            this.firestore,
            `${messengerType}/${messengerID}/messages`
          ),
          docRef.id
        ),
        {
          messageID: docRef.id,
        }
      );
    });
  }

  addThreadMessage(messageData: any, channelID: string, messageID: string) {
    addDoc(
      collection(
        this.firestore,
        `channels/${channelID}/messages/${messageID}/threadMessages`
      ),
      messageData
    ).then((docRef: any) => {
      updateDoc(
        doc(
          collection(
            this.firestore,
            `channels/${channelID}/messages/${messageID}/threadMessages/`
          ),
          docRef.id
        ),
        {
          messageID: docRef.id,
        }
      );
    });
  }

  ///////////////////////////////////////// updateFunctions /////////////////////////////////////////

  async updateUserWithChannelOrDirectMessage(
    userID: string,
    messengerType: string,
    messengerID: string
  ) {
    try {
      await updateDoc(doc(this.userCol, userID), {
        [messengerType]: arrayUnion(messengerID),
      });
      console.log('Channel successfully added');
    } catch (error) {
      console.error(
        'Error updating channel: ',
        messengerID,
        ' in User: ',
        userID,
        ' : ',
        error
      );
    }
  }

  updateUser(userData: Partial<User>, userID: string) {
    updateDoc(doc(this.userCol, userID), userData);
  }

  addMemberToChannel(userID: string, channelID: string) {
    return updateDoc(doc(this.channelCol, channelID), {
      member: arrayUnion(userID),
    });
  }

  updateChannel(channelData: Partial<Channel>, channelID: string) {
    updateDoc(doc(this.channelCol, channelID), channelData);
  }

  updateMessage(
    messageData: Partial<Message>,
    messengerType: string,
    messengerID: string,
    messageID: string
  ) {
    updateDoc(
      doc(
        collection(
          this.firestore,
          `${messengerType}/${messengerID}/messages/${messageID}`
        )
      ),
      messageData
    );
  }

  updateThreadMessage(
    messageData: Partial<Message>,
    messengerType: string,
    messengerID: string,
    messageID: string,
    threadID: string
  ) {
    updateDoc(
      doc(
        collection(
          this.firestore,
          `${messengerType}/${messengerID}/messages/${messageID}/thread/${threadID}`
        )
      ),
      messageData
    );
  }

  ///////////////////////////////////////// deleteFunctions /////////////////////////////////////////

  deleteUser(userID: string) {
    deleteDoc(doc(this.userCol, userID));
  }

  deleteChannel(channelID: string) {
    deleteDoc(doc(this.channelCol, channelID));
  }

  deleteDirectMessage(directMessageID: string) {
    deleteDoc(doc(this.directMessageCol, directMessageID));
  }

  deleteMessage(messageID: string, messengerType: string, messengerID: string) {
    deleteDoc(
      doc(
        collection(
          this.firestore,
          `${messengerType}/${messengerID}/messages/${messageID}`
        )
      )
    );
  }
}
