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
import { combineLatest, map, Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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

  /**
   * Constructor for the FirestoreService.
   *
   * Subscribes to the allUsers$ observable and loads the user list when the service is initialized.
   * @param firestore Injected service to interact with Firestore.
   */
  constructor(private firestore: Firestore) {
    this.loadUserList();
  }

  ///////////////////////////////////////// loadFunctions /////////////////////////////////////////

  /**
   * Loads the user list from Firestore.
   *
   * Subscribes to the allUsers$ observable and loads the user list when the service is initialized.
   * When the observable emits a new value, it assigns the users to the allUsers property.
   * The subscription is automatically unsubscribed when the service is destroyed.
   */
  loadUserList() {
    this.allUsers$ = this.getUsers();
    this.allUsers$.pipe(takeUntil(this.destroy$)).subscribe((users) => {
      this.allUsers = users;
    });
  }

  /**
   * Returns an observable that emits an array of all users in the users collection.
   *
   * @returns An observable of an array of all users in the users collection.
   */
  getUsers(): Observable<any[]> {
    return collectionData(this.userCol);
  }

  /**
   * Returns an observable that emits an array of channels with the given IDs from the channels collection.
   *
   * If the channels are already cached, it returns the cached channels. Otherwise, it queries the channels collection
   * in chunks of 10 and combines the results into a single array. The channels are then cached by their IDs.
   * @param channelIDs The IDs of the channels to be loaded.
   * @returns An observable of an array of channels with the given IDs from the channels collection.
   */
  getChannels(channelIDs: string[]): Observable<any[]> {
    if (this.channelsCache[channelIDs.join(',')]) {
      return of(this.channelsCache[channelIDs.join(',')]);
    }
    if (channelIDs.length === 0) {
      return of([]);
    }
    const idGroups = this.chunkArray(channelIDs, 10);
    const queries = idGroups.map((ids) => {
      const q = query(this.channelCol, where('channelID', 'in', ids));
      return collectionData(q);
    });
    return combineLatest(queries).pipe(
      map((results) => {
        const channels = results.flat();
        this.channelsCache[channelIDs.join(',')] = channels;
        return channels;
      })
    );
  }

  /**
   * Returns an observable that emits an array of direct messages with the given IDs from the directMessages collection.
   *
   * If the direct messages are already cached, it returns the cached direct messages. Otherwise, it queries the directMessages collection
   * in chunks of 10 and combines the results into a single array. The direct messages are then cached by their IDs.
   * @param directMessageIDs The IDs of the direct messages to be loaded.
   * @returns An observable of an array of direct messages with the given IDs from the directMessages collection.
   */
  getDirectMessages(directMessageIDs: string[]): Observable<any[]> {
    if (this.directMessagesCache[directMessageIDs.join(',')]) {
      return of(this.directMessagesCache[directMessageIDs.join(',')]);
    }
    if (directMessageIDs.length === 0) {
      return of([]);
    }
    const idGroups = this.chunkArray(directMessageIDs, 10);
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
        this.directMessagesCache[directMessageIDs.join(',')] = directMessages;
        return directMessages;
      })
    );
  }

  /**
   * Splits the given array into chunks of the given size.
   *
   * @param arr The array to be split.
   * @param size The size of each chunk.
   * @returns An array of arrays, where each inner array is a chunk of size `size` from the original array.
   */
  chunkArray(arr: string[], size: number): string[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  /**
   * Retrieves a single thread message from the Firestore database.
   *
   * @param channelID The ID of the channel that the thread message belongs to.
   * @param threadMessageID The ID of the thread message.
   * @returns An Observable that resolves to a DocumentSnapshot of the thread message.
   */
  getThread(channelID: string, threadMessageID: string) {
    return getDoc(
      doc(this.firestore, `channels/${channelID}/messages/${threadMessageID}`)
    );
  }

  /**
   * Retrieves all messages from the Firestore database for the given messenger type and ID.
   *
   * @param messengerType The type of messenger (e.g. 'channels', 'directMessages').
   * @param messengerID The ID of the messenger.
   * @returns An Observable that resolves to an array of DocumentSnapshot objects, each representing a message.
   */
  getMessages(messengerType: string, messengerID: string): Observable<any[]> {
    return collectionData(
      collection(this.firestore, `${messengerType}/${messengerID}/messages`)
    );
  }

  /**
   * Retrieves all thread messages from the Firestore database for the given channel and thread message.
   *
   * @param channelID The ID of the channel that the thread message belongs to.
   * @param threadMessageID The ID of the thread message.
   * @returns An Observable that resolves to an array of DocumentSnapshot objects, each representing a thread message.
   */
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

  /**
   * Adds a new user document to the Firestore database. If the user ID already exists, it will be overwritten.
   * @param userData The data to add to the user document.
   * @returns A Promise that resolves to the newly added user document's ID.
   */
  async addUser(userData: any): Promise<any> {
    try {
      const userRef = doc(this.firestore, `users/${userData.userID}`);
      setDoc(userRef, userData);
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Adds a new channel document to the Firestore database, and updates the given user's document to include the newly added channel.
   * @param channelData The data to add to the channel document.
   * @param userID The ID of the user who is adding the channel.
   */
  addChannel(channelData: any, userID: string) {
    addDoc(this.channelCol, channelData).then((docRef) => {
      updateDoc(doc(this.channelCol, docRef.id), {
        channelID: docRef.id,
      });
      this.updateUserWithChannelOrDirectMessage(userID, 'channels', docRef.id);
    });
  }

  /**
   * Adds a new direct message document to the Firestore database, and updates the documents of the two users who are participating in the direct message to include the newly added direct message.
   * @param directMessageData The data to add to the direct message document.
   * @param userID1 The ID of the first user who is participating in the direct message.
   * @param userID2 The ID of the second user who is participating in the direct message.
   * @returns A Promise that resolves to the newly added direct message document.
   */
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

  /**
   * Adds a new direct message document to the Firestore database, with the given user as the only member.
   * This is used to create a "self direct message" which is a direct message that a user can send to themselves.
   * This is useful for testing and development purposes.
   * @param userID The ID of the user to add as the member of the direct message.
   */
  addSelfDirectMessage(userID: string) {
    setDoc(doc(this.directMessageCol, userID), {
      member: userID,
      directMessageID: userID,
    });
  }

  /**
   * Adds a new message document to the Firestore database.
   * The message is added to the messages subcollection of the given messenger type and messenger ID.
   * The message data is updated with a "messageID" field containing the ID of the newly added document.
   * @param messageData The message data to be added.
   * @param messengerType The type of messenger (e.g. channel, directMessage).
   * @param messengerID The ID of the messenger.
   */
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

  /**
   * Adds a new message document to the Firestore database.
   * The message is added to the "threadMessages" subcollection of the given channel and message.
   * The message data is updated with a "messageID" field containing the ID of the newly added document.
   * @param messageData The message data to be added.
   * @param channelID The ID of the channel.
   * @param messageID The ID of the message.
   */
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

  /**
   * Updates a user document in the Firestore database by adding a new
   * channel or direct message to the user's list of channels or direct messages.
   * @param userID The ID of the user document to be updated.
   * @param messengerType The type of messenger (either "channels" or "directMessages").
   * @param messengerID The ID of the channel or direct message to be added.
   */
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

  /**
   * Updates a user document in the Firestore database with the given user data.
   * @param userData The partial user data to be used for the update.
   * @param userID The ID of the user document to be updated.
   */
  updateUser(userData: Partial<User>, userID: string) {
    updateDoc(doc(this.userCol, userID), userData);
  }

  /**
   * Adds a user to a channel by updating the channel's "member" field with the
   * user's ID. The user will be added to the channel if they are not already a
   * member.
   * @param userID The ID of the user to be added to the channel.
   * @param channelID The ID of the channel to which the user should be added.
   */
  addMemberToChannel(userID: string, channelID: string) {
    return updateDoc(doc(this.channelCol, channelID), {
      member: arrayUnion(userID),
    });
  }

  /**
   * Updates a channel document in the Firestore database with the given channel
   * data.
   * @param channelData The partial channel data to be used for the update.
   * @param channelID The ID of the channel document to be updated.
   */
  updateChannel(channelData: Partial<Channel>, channelID: string) {
    updateDoc(doc(this.channelCol, channelID), channelData);
  }

  /**
   * Updates a message document in the Firestore database with the given message
   * data. The message can be either a channel message or a direct message.
   * @param messageData The partial message data to be used for the update.
   * @param messengerType The type of messenger to which the message belongs.
   *                      Either 'channels' or 'directMessages'.
   * @param messengerID The ID of the messenger to which the message belongs.
   * @param messageID The ID of the message document to be updated.
   */
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

  /**
   * Updates a thread message document in the Firestore database with the given
   * message data. The thread message belongs to a message in a channel.
   * @param messageData The partial message data to be used for the update.
   * @param channelID The ID of the channel to which the message belongs.
   * @param messageID The ID of the message to which the thread message belongs.
   * @param threadID The ID of the thread message document to be updated.
   */
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

  /**
   * Deletes a message document in the Firestore database. The message belongs
   * to either a channel or a direct message, depending on the value of
   * `messengerType`.
   * @param messageID The ID of the message to be deleted.
   * @param messengerType The type of messenger to which the message belongs, either
   * `channels` or `directMessages`.
   * @param messengerID The ID of the channel or direct message to which the message
   * belongs.
   */
  deleteMessage(messageID: string, messengerType: string, messengerID: string) {
    deleteDoc(
      doc(
        collection(this.firestore, `${messengerType}/${messengerID}/messages`),
        messageID
      )
    );
  }

  /**
   * Deletes a thread message document in the Firestore database. The message
   * belongs to a thread which belongs to a channel.
   * @param channelID The ID of the channel to which the message belongs.
   * @param threadMessageID The ID of the thread to which the message belongs.
   * @param messageID The ID of the message to be deleted.
   */
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

  /**
   * Unsubscribes from all Firestore subscriptions when the component is destroyed.
   *
   * This is needed to prevent memory leaks when the component is destroyed and
   * recreated.
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
