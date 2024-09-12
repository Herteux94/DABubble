// import { Injectable, OnDestroy } from '@angular/core';
// import {
//   Firestore,
//   collection,
//   collectionData,
//   addDoc,
//   doc,
//   updateDoc,
//   deleteDoc,
//   arrayUnion,
//   setDoc,
//   getDoc,
//   DocumentReference,
//   query,
//   where,
// } from '@angular/fire/firestore';
// import { combineLatest, map, Observable, of, Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
// import { Channel } from '../models/channel.model';
// import { User } from '../models/user.model';
// import { Message } from '../models/message.model';

// @Injectable({
//   providedIn: 'root',
// })
// export class FirestoreService implements OnDestroy {
//   private destroy$ = new Subject<void>(); // Subject to handle unsubscription

//   userCol = collection(this.firestore, 'users');
//   channelCol = collection(this.firestore, 'channels');
//   directMessageCol = collection(this.firestore, 'directMessages');

//   allUsers$!: Observable<User[]>;
//   allUsers: User[] = [];

//   constructor(private firestore: Firestore) {
//     this.loadUserList();
//   }

//   ///////////////////////////////////////// loadFunctions /////////////////////////////////////////

//   loadUserList() {
//     this.allUsers$ = this.getUsers();
//     this.allUsers$
//       .pipe(takeUntil(this.destroy$)) // Ensure unsubscription
//       .subscribe((users) => {
//         this.allUsers = users;
//       });
//   }

//   getUsers(): Observable<any[]> {
//     return collectionData(this.userCol);
//   }

//   getChannels(channelIDs: string[]): Observable<any[]> {
//     if (channelIDs.length === 0) {
//       return of([]);
//     }

//     const idGroups = this.chunkArray(channelIDs, 10);
//     const queries = idGroups.map((ids) => {
//       const q = query(this.channelCol, where('channelID', 'in', ids));
//       return collectionData(q);
//     });

//     return combineLatest(queries).pipe(map((results) => results.flat()));
//   }

//   getDirectMessages(directMessageIDs: string[]): Observable<any[]> {
//     if (directMessageIDs.length === 0) {
//       return of([]);
//     }

//     const idGroups = this.chunkArray(directMessageIDs, 10);
//     const queries = idGroups.map((ids) => {
//       const q = query(
//         this.directMessageCol,
//         where('directMessageID', 'in', ids)
//       );
//       return collectionData(q);
//     });

//     return combineLatest(queries).pipe(map((results) => results.flat()));
//   }

//   chunkArray(arr: string[], size: number): string[][] {
//     const result = [];
//     for (let i = 0; i < arr.length; i += size) {
//       result.push(arr.slice(i, i + size));
//     }
//     return result;
//   }

//   getThread(channelID: string, threadMessageID: string) {
//     return getDoc(
//       doc(this.firestore, `channels/${channelID}/messages/${threadMessageID}`)
//     );
//   }

//   getMessages(messengerType: string, messengerID: string): Observable<any[]> {
//     return collectionData(
//       collection(this.firestore, `${messengerType}/${messengerID}/messages`)
//     );
//   }

//   getThreadMessages(
//     channelID: string,
//     threadMessageID: string
//   ): Observable<any[]> {
//     return collectionData(
//       collection(
//         this.firestore,
//         `channels/${channelID}/messages/${threadMessageID}/threadMessages`
//       )
//     );
//   }

//   ///////////////////////////////////////// addFunctions /////////////////////////////////////////

//   async addUser(userData: any): Promise<any> {
//     try {
//       const userRef = doc(this.firestore, `users/${userData.userID}`);
//       setDoc(userRef, userData);
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   addChannel(channelData: any, userID: string) {
//     addDoc(this.channelCol, channelData).then((docRef) => {
//       updateDoc(doc(this.channelCol, docRef.id), {
//         channelID: docRef.id,
//       });
//       this.updateUserWithChannelOrDirectMessage(userID, 'channels', docRef.id);
//     });
//   }

//   async addDirectMessage(
//     directMessageData: any,
//     userID1: string,
//     userID2: any
//   ): Promise<DocumentReference> {
//     return addDoc(this.directMessageCol, directMessageData).then((docRef) => {
//       updateDoc(doc(this.directMessageCol, docRef.id), {
//         directMessageID: docRef.id,
//       });
//       this.updateUserWithChannelOrDirectMessage(
//         userID1,
//         'directMessages',
//         docRef.id
//       );
//       this.updateUserWithChannelOrDirectMessage(
//         userID2,
//         'directMessages',
//         docRef.id
//       );
//       return docRef;
//     });
//   }

//   addSelfDirectMessage(userID: string) {
//     setDoc(doc(this.directMessageCol, userID), {
//       member: userID,
//       directMessageID: userID,
//     });
//   }

//   addMessage(messageData: any, messengerType: string, messengerID: string) {
//     addDoc(
//       collection(this.firestore, `${messengerType}/${messengerID}/messages`),
//       messageData
//     ).then((docRef: any) => {
//       updateDoc(
//         doc(
//           collection(
//             this.firestore,
//             `${messengerType}/${messengerID}/messages`
//           ),
//           docRef.id
//         ),
//         {
//           messageID: docRef.id,
//         }
//       );
//     });
//   }

//   addThreadMessage(messageData: any, channelID: string, messageID: string) {
//     addDoc(
//       collection(
//         this.firestore,
//         `channels/${channelID}/messages/${messageID}/threadMessages`
//       ),
//       messageData
//     ).then((docRef: any) => {
//       updateDoc(
//         doc(
//           collection(
//             this.firestore,
//             `channels/${channelID}/messages/${messageID}/threadMessages/`
//           ),
//           docRef.id
//         ),
//         {
//           messageID: docRef.id,
//         }
//       );
//     });
//   }

//   ///////////////////////////////////////// updateFunctions /////////////////////////////////////////

//   async updateUserWithChannelOrDirectMessage(
//     userID: string,
//     messengerType: string,
//     messengerID: string
//   ) {
//     try {
//       await updateDoc(doc(this.userCol, userID), {
//         [messengerType]: arrayUnion(messengerID),
//       });
//       console.log('Channel successfully added');
//     } catch (error) {
//       console.error(
//         'Error updating channel: ',
//         messengerID,
//         ' in User: ',
//         userID,
//         ' : ',
//         error
//       );
//     }
//   }

//   updateUser(userData: Partial<User>, userID: string) {
//     updateDoc(doc(this.userCol, userID), userData);
//   }

//   addMemberToChannel(userID: string, channelID: string) {
//     return updateDoc(doc(this.channelCol, channelID), {
//       member: arrayUnion(userID),
//     });
//   }

//   updateChannel(channelData: Partial<Channel>, channelID: string) {
//     updateDoc(doc(this.channelCol, channelID), channelData);
//   }

//   updateMessage(
//     messageData: Partial<Message>,
//     messengerType: string,
//     messengerID: string,
//     messageID: string
//   ) {
//     updateDoc(
//       doc(
//         collection(this.firestore, `${messengerType}/${messengerID}/messages`),
//         messageID
//       ),
//       messageData
//     );
//   }

//   updateThreadMessage(
//     messageData: Partial<Message>,
//     channelID: string,
//     messageID: string,
//     threadID: string
//   ) {
//     updateDoc(
//       doc(
//         collection(
//           this.firestore,
//           `channels/${channelID}/messages/${messageID}/threadMessages`
//         ),
//         threadID
//       ),
//       messageData
//     );
//   }

//   ///////////////////////////////////////// deleteFunctions /////////////////////////////////////////

//   deleteUser(userID: string) {
//     deleteDoc(doc(this.userCol, userID));
//   }

//   deleteChannel(channelID: string) {
//     deleteDoc(doc(this.channelCol, channelID));
//   }

//   deleteMessage(messageID: string, messengerType: string, messengerID: string) {
//     deleteDoc(
//       doc(
//         collection(this.firestore, `${messengerType}/${messengerID}/messages`),
//         messageID
//       )
//     );
//   }

//   deleteThreadMessage(
//     channelID: string,
//     threadMessageID: string,
//     messageID: string
//   ) {
//     deleteDoc(
//       doc(
//         collection(
//           this.firestore,
//           `channels/${channelID}/messages/${threadMessageID}/threadMessages`
//         ),
//         messageID
//       )
//     );
//   }

//   // Cleanup method to unsubscribe from all observables
//   ngOnDestroy() {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
// }

import { Injectable, OnDestroy } from '@angular/core';
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
import {
  combineLatest,
  map,
  Observable,
  of,
  Subject,
  BehaviorSubject,
} from 'rxjs';
import { takeUntil, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { Channel } from '../models/channel.model';
import { User } from '../models/user.model';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService implements OnDestroy {
  private destroy$ = new Subject<void>(); // Subject to handle unsubscription

  userCol = collection(this.firestore, 'users');
  channelCol = collection(this.firestore, 'channels');
  directMessageCol = collection(this.firestore, 'directMessages');

  private channelsCache: { [key: string]: any[] } = {}; // Cache for Channels
  private directMessagesCache: { [key: string]: any[] } = {}; // Cache for DirectMessages

  allUsers$!: Observable<User[]>;
  allUsers: User[] = [];

  constructor(private firestore: Firestore) {
    this.loadUserList();
  }

  ///////////////////////////////////////// loadFunctions /////////////////////////////////////////

  loadUserList() {
    this.allUsers$ = this.getUsers();
    this.allUsers$
      .pipe(takeUntil(this.destroy$)) // Ensure unsubscription
      .subscribe((users) => {
        this.allUsers = users;
      });
  }

  getUsers(): Observable<any[]> {
    return collectionData(this.userCol);
  }

  getChannels(channelIDs: string[]): Observable<any[]> {
    // Check if the channel data is already cached to avoid unnecessary API calls
    if (this.channelsCache[channelIDs.join(',')]) {
      console.log('got channels from cache');

      return of(this.channelsCache[channelIDs.join(',')]);
    }

    if (channelIDs.length === 0) {
      return of([]); // Return an empty array if no IDs are provided
    }

    const idGroups = this.chunkArray(channelIDs, 10); // Group IDs into smaller chunks
    const queries = idGroups.map((ids) => {
      const q = query(this.channelCol, where('channelID', 'in', ids));
      return collectionData(q);
    });

    return combineLatest(queries).pipe(
      map((results) => {
        const channels = results.flat();
        this.channelsCache[channelIDs.join(',')] = channels; // Cache the result
        return channels;
      })
    );
  }

  getDirectMessages(directMessageIDs: string[]): Observable<any[]> {
    // Check if the direct messages data is already cached to avoid unnecessary API calls
    if (this.directMessagesCache[directMessageIDs.join(',')]) {
      console.log('got DMs from cache');

      return of(this.directMessagesCache[directMessageIDs.join(',')]);
    }

    if (directMessageIDs.length === 0) {
      return of([]); // Return an empty array if no IDs are provided
    }

    const idGroups = this.chunkArray(directMessageIDs, 10); // Group IDs into smaller chunks
    const queries = idGroups.map((ids) => {
      const q = query(
        this.directMessageCol,
        where('directMessageID', 'in', ids)
      );
      return collectionData(q);
    });

    return combineLatest(queries).pipe(
      map((results) => {
        const directMessages = results.flat();
        this.directMessagesCache[directMessageIDs.join(',')] = directMessages; // Cache the result
        return directMessages;
      })
    );
  }

  chunkArray(arr: string[], size: number): string[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
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
    userID2: any
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

  addSelfDirectMessage(userID: string) {
    setDoc(doc(this.directMessageCol, userID), {
      member: userID,
      directMessageID: userID,
    });
  }

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
        collection(this.firestore, `${messengerType}/${messengerID}/messages`),
        messageID
      ),
      messageData
    );
  }

  updateThreadMessage(
    messageData: Partial<Message>,
    channelID: string,
    messageID: string,
    threadID: string
  ) {
    updateDoc(
      doc(
        collection(
          this.firestore,
          `channels/${channelID}/messages/${messageID}/threadMessages`
        ),
        threadID
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

  deleteMessage(messageID: string, messengerType: string, messengerID: string) {
    deleteDoc(
      doc(
        collection(this.firestore, `${messengerType}/${messengerID}/messages`),
        messageID
      )
    );
  }

  deleteThreadMessage(
    channelID: string,
    threadMessageID: string,
    messageID: string
  ) {
    deleteDoc(
      doc(
        collection(
          this.firestore,
          `channels/${channelID}/messages/${threadMessageID}/threadMessages`
        ),
        messageID
      )
    );
  }

  // Cleanup method to unsubscribe from all observables
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
