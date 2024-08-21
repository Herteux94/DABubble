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
  arrayUnion
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel.model';
import { User } from '../models/user.model';
import { Message } from '../models/message.model';
import { DirectMessage } from '../models/directMessages.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  userCol = collection(this.firestore, 'users');
  channelCol = collection(this.firestore, 'channels');
  directMessageCol = collection(this.firestore, 'directMessages');
  
  allUsers$!: Observable<User[]>;
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

  loadUserList() {
    this.allUsers$ = this.getUsers();
    this.allUsers$.subscribe((users) => {
      this.allUsers = users;
    });
    console.log(this.allUsers);  
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

  //////////////////////////////////////////////////

  addUser(userData: User) {
    addDoc(this.userCol, userData)
    .then((docRef) => {
      updateDoc(doc(this.userCol, docRef.id), {
        userID: docRef.id
      });
    });
  }

  addChannel(channelData: Channel) {
    addDoc(this.channelCol, channelData)
    .then((docRef) => {
      updateDoc(doc(this.channelCol, docRef.id), {
        channelID: docRef.id
      });
    });
  }

  addDirectMessage(directMessageData: DirectMessage) {
    addDoc(this.directMessageCol, directMessageData)
    .then((docRef) => {
      updateDoc(doc(this.directMessageCol, docRef.id), {
        directMessageID: docRef.id
      });
    });
  }
  
  addMessage(messageData: Message, messengerType: string , messengerID: string) {
    updateDoc(doc(collection(this.firestore, `${messengerType}/${messengerID}/messages`)), {
      messages: arrayUnion(messageData)
    })
    .then((docRef: any) => {
      updateDoc(doc(collection(this.firestore, `${messengerType}/${messengerID}/messages`)), {
        messageID: docRef.id
      });
    });
  }

  addThreadMessage(messageData: Message, channelID: string, messageID: string) {
    updateDoc(doc(collection(this.firestore, `channels/${channelID}/messages/${messageID}`)), {
      messages: arrayUnion(messageData)
    })
    .then((docRef: any) => {
      updateDoc(doc(collection(this.firestore, `channels/${channelID}/messages/${messageID}`)), {
        messageID: docRef.id
      });
    });
  }




  
  
  deleteChannel(channelID: string) {
    deleteDoc(doc(this.channelCol, channelID));
  }
  
  deleteMessage(messageID: string) {
    deleteDoc(doc(this.messageCol, messageID));
  }
  
  updateMessage(messageData: any, messageID: string) {
    updateDoc(doc(this.messageCol, messageID), {
      content: messageData.content,
      attachments: messageData.attachments
    });
  }
  
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

  pushMessageToChannel(messageData: any, channelID: string) {
    updateDoc(doc(this.channelCol, channelID), {
      messages: arrayUnion(messageData)
    });
  }

  async getActiveChannel(channelID: string) {
    let activeChannel = await getDoc(doc(this.channelCol, channelID));
    return activeChannel.data();
  }

  // async getMessagesFromActiveChannel(messageIDs: any) {
  //   let messages: any = [];
  //   messageIDs.forEach((messageID: string) => {
  //     let message = await getDoc(doc(this.messageCol, messageID));
  //     messages.push(message);
  //     console.log(message);
  //   });
  //   console.log(messages);
  //   return messages;
  // }

}
