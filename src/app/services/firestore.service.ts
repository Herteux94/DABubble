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
  getDocs,
  deleteDoc,
  arrayUnion
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService implements OnDestroy {
  userCol = collection(this.firestore, 'users');
  channelCol = collection(this.firestore, 'channels');
  messageCol = collection(this.firestore, 'messages');
  
  allChannels$!: Observable<any[]>;
  
  allUsers: any[] = [];
  allChannels: any[] = [];
  allMessages: any[] = [];


  unsubUserList: any;
  // unsubChannelList: any;
  unsubMessageList: any;

  constructor(private firestore: Firestore) { 
    this.getUsers();
    this.loadChannelList();
    this.getMessages();        
  }

  getUsers() {
    this.unsubUserList = onSnapshot(this.userCol, (userList) => {
      this.allUsers = [];
      userList.forEach(user => {
        this.allUsers.push(user.data());
      });
    })
  }

  // getChannels() {
  //   this.unsubChannelList = onSnapshot(this.channelCol, (channelList) => {
  //     this.allChannels = [];
  //     channelList.forEach(channel => {
  //       this.allChannels.push(channel.data());
  //     });
  //   })
  // }

  loadChannelList() {
    this.allChannels$ = this.getChannels();
    this.allChannels$.subscribe((channels) => {
      this.allChannels = channels;
    });    
  }

  getChannels(): Observable<any[]> {
    return collectionData(this.channelCol);
  }

  getMessages() {
    this.unsubMessageList = onSnapshot(this.messageCol, (messageList) => {
      this.allMessages = [];
      messageList.forEach(message => {
        this.allMessages.push(message.data());
      });
    })
  }
  
  ngOnDestroy() {
    this.unsubUserList();
    // this.unsubChannelList();
    this.unsubMessageList();
  }

  addUser(userData: any) {
    addDoc(this.userCol, userData)
    .then((docRef) => {
      updateDoc(doc(this.userCol, docRef.id), {
        userID: docRef.id
      });
    });
  }

  addChannel(channelData: any) {
    addDoc(this.channelCol, channelData)
    .then((docRef) => {
      updateDoc(doc(this.channelCol, docRef.id), {
        channelID: docRef.id
      });
    });
  }

  addChannelMessage(messageData: any, channelID: string) {
    let message = {[messageData.messageID]: messageData}
    updateDoc(doc(this.channelCol, channelID), {
      messages: message
    })
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
