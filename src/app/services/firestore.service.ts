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
  query,
  where,
} from '@angular/fire/firestore';
import { forkJoin, map, Observable, of } from 'rxjs';
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
  // allChannels$!: Observable<Channel[]>;
  allDirectMessages$!: Observable<DirectMessage[]>;

  allUsers: User[] = [];
  // allChannels: Channel[] = [];
  allDirectMessages: DirectMessage[] = [];

  constructor(private firestore: Firestore) {
    this.loadUserList();
    // this.loadChannelList();
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

  // loadChannelList() {
  //   this.allChannels$ = this.getChannels();
  //   this.allChannels$.subscribe((channels) => {
  //     this.allChannels = channels;
  //   });
  // }

  getChannels(channelIDs: string[]): Observable<any[]> {
    if (channelIDs.length === 0) {
      return of([]); // Falls keine IDs vorhanden sind, gib ein leeres Array zurück
    }

    // IDs in Gruppen von maximal 10 aufteilen
    const idGroups = this.chunkArray(channelIDs, 10);

    // Abfragen für jede Gruppe erstellen und die Observables sammeln
    const queries = idGroups.map((ids) => {
      const q = query(this.channelCol, where('channelID', 'in', ids));
      return collectionData(q); // Firestore-Abfrage als Observable zurückgeben
    });

    // Die Ergebnisse aller Observables kombinieren und als flaches Array zurückgeben
    return forkJoin(queries).pipe(
      map((results) => results.flat()) // flacht die verschachtelten Arrays zu einem einzigen Array ab
    );
  }

  // loadDirectMessageList() {
  //   this.allDirectMessages$ = this.getDirectMessages();
  //   this.allDirectMessages$.subscribe((directMessages) => {
  //     this.allDirectMessages = directMessages;
  //   });
  // }

  getDirectMessages(directMessageIDs: string[]): Observable<any[]> {
    if (directMessageIDs.length === 0) {
      return of([]); // Falls keine IDs vorhanden sind, gib ein leeres Array zurück
    }

    // IDs in Gruppen von maximal 10 aufteilen
    const idGroups = this.chunkArray(directMessageIDs, 10);

    // Abfragen für jede Gruppe erstellen und die Observables sammeln
    const queries = idGroups.map((ids) => {
      const q = query(
        this.directMessageCol,
        where('directMessageID', 'in', ids)
      );
      return collectionData(q); // Firestore-Abfrage als Observable zurückgeben
    });

    // Die Ergebnisse aller Observables kombinieren und als flaches Array zurückgeben
    return forkJoin(queries).pipe(
      map((results) => results.flat()) // flacht die verschachtelten Arrays zu einem einzigen Array ab
    );
  }

  // Hilfsfunktion, um ein Array in kleinere Arrays von max. 10 Elementen aufzuteilen
  chunkArray(arr: string[], size: number): string[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  getThread(channelID: string, threadMessageID: string) {
    // muss auch als Observable deklariert werden und sofort ein Array füllen, das angezapft wird vom HTML zum rendern
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

  async addUser(userData: any): Promise<any> {
    try {
      const userRef = doc(this.firestore, `users/${userData.userID}`);
      setDoc(userRef, userData);
    } catch (err) {
      console.log(err);
    }
  }

  addChannel(channelData: any, userID: string) {
    addDoc(this.channelCol, channelData).then((docRef) => {
      updateDoc(doc(this.channelCol, docRef.id), {
        channelID: docRef.id,
      });
      this.updateUserWithChannelOrDirectMessage(userID, 'channels', docRef.id);
    });
  }

  async addDirectMessage(
    directMessageData: any,
    userID1: string,
    userID2: string
  ): Promise<DocumentReference> {
    return addDoc(this.directMessageCol, directMessageData).then((docRef) => {
      updateDoc(doc(this.directMessageCol, docRef.id), {
        directMessageID: docRef.id,
      });
      this.updateUserWithChannelOrDirectMessage(
        userID1,
        'directMessages',
        docRef.id
      );
      this.updateUserWithChannelOrDirectMessage(
        userID2,
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
