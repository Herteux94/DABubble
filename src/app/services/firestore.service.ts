import { Injectable, OnDestroy } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  arrayUnion,
  setDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel.model';
import { User } from '../models/user.model';
import { DirectMessage } from '../models/directMessages.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  userCol = collection(this.firestore, 'users');
  channelCol = collection(this.firestore, 'channels');
  directMessageCol = collection(this.firestore, 'directMessages');
  
  allUsers$!: Observable<any[]>;
  allChannels$!: Observable<Channel[]>;
  allDirectMessages$!: Observable<DirectMessage[]>;
  
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

  ///////////////////////////////////////// addFunctions /////////////////////////////////////////

  async addUser(userData: any) {
    const userRef = doc(this.firestore, `users/${userData.userID}`)
    setDoc(userRef, userData);
  }

  addChannel(channelData: any) {
    addDoc(this.channelCol, channelData)
    .then((docRef) => {
      updateDoc(doc(this.channelCol, docRef.id), {
        channelID: docRef.id
      });
    });
  }

  addDirectMessage(directMessageData: any) {
    addDoc(this.directMessageCol, directMessageData)
    .then((docRef) => {
      updateDoc(doc(this.directMessageCol, docRef.id), {
        directMessageID: docRef.id
      });
    });
  }
  
  addMessage(messageData: any, messengerType: string , messengerID: string) {
    updateDoc(doc(collection(this.firestore, `${messengerType}/${messengerID}/messages`)), {
      messages: arrayUnion(messageData)
    })
    .then((docRef: any) => {
      updateDoc(doc(collection(this.firestore, `${messengerType}/${messengerID}/messages`)), {
        messageID: docRef.id
      });
    });
  }

  addThreadMessage(messageData: any, channelID: string, messageID: string) {
    updateDoc(doc(collection(this.firestore, `channels/${channelID}/messages/${messageID}/thread`)), {
      messages: arrayUnion(messageData)
    })
    .then((docRef: any) => {
      updateDoc(doc(collection(this.firestore, `channels/${channelID}/messages/${messageID}/thread`)), {
        messageID: docRef.id
      });
    });
  }

    ///////////////////////////////////////// updateFunctions /////////////////////////////////////////

    updateUser(userData: any, userID: string) {
      updateDoc(doc(this.userCol, userID), {
        name: userData.name,
        profileImg: userData.profileImg,
        email: userData.email
      });
    }
    
    updateChannel(channelData: any, channelID: string) {
      updateDoc(doc(this.channelCol, channelID), {
        name: channelData.name,
        description: channelData.description,
        member: channelData.member
      });
    }

    updateMessage(messageData: any, messengerType: string , messengerID: string, messageID: string) {
      updateDoc(doc(collection(this.firestore, `${messengerType}/${messengerID}/messages/${messageID}`)), {
        content: messageData.content,
        attachments: messageData.attachments,
        reaction: messageData.reaction
      });
    }

    updateThreadMessage(messageData: any, messengerType: string , messengerID: string, messageID: string, threadID: string) {
      updateDoc(doc(collection(this.firestore, `${messengerType}/${messengerID}/messages/${messageID}/thread/${threadID}`)), {
        content: messageData.content,
        attachments: messageData.attachments,
        reaction: messageData.reaction
      });
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
    
    deleteMessage(messageID: string, messengerType: string , messengerID: string) {
      deleteDoc(doc(collection(this.firestore, `${messengerType}/${messengerID}/messages/${messageID}`)));
    }

}
