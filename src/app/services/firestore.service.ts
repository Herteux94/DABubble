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
  // messageCol = collection(this.firestore, 'messages');

  allUsers: any[] = [];
  allChannels: any[] = [];
  // allMessages: any[] = [];

  unsubUserList: any;
  unsubChannelList: any;
  // unsubMessageList: any;

  constructor(private firestore: Firestore) { 
    this.getUsers();
    this.getChannels();
    // this.getMessages();        
  }

  getUsers() {
    this.unsubUserList = onSnapshot(this.userCol, (userList) => {
      this.allUsers = [];
      userList.forEach(user => {
        this.allUsers.push(user.data());
      });
    })
  }

  getChannels() {
    this.unsubChannelList = onSnapshot(this.channelCol, (channelList) => {
      this.allChannels = [];
      channelList.forEach(channel => {
        this.allChannels.push(channel.data());
      });
    })
  }

  // getMessages() {
  //   this.unsubMessageList = onSnapshot(this.messageCol, (messageList) => {
  //     this.allMessages = [];
  //     messageList.forEach(message => {
  //       this.allMessages.push(message.data());
  //     });
  //   })
  // }
  
  ngOnDestroy() {
    this.unsubUserList();
    this.unsubChannelList();
    // this.unsubMessageList();
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

  // addMessage(messageData: any) {
  //   addDoc(this.messageCol, messageData)
  //   .then((docRef) => {
  //     updateDoc(doc(this.messageCol, docRef.id), {
  //       messageID: docRef.id
  //     });
  //   });
  // }

  deleteChannel(channelID: string) {
    deleteDoc(doc(this.channelCol, channelID));
  }

  // deleteMessage(messageID: string) {
  //   deleteDoc(doc(this.messageCol, messageID));
  // }

  // updateMessage(messageData: any, messageID: string) {
  //   updateDoc(doc(this.messageCol, messageID), {
  //     content: messageData.content,
  //     attachments: messageData.attachments
  //   });
  // }

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



}
