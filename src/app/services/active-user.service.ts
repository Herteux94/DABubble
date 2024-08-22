import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Channel } from '../models/channel.model';
import { DirectMessage } from '../models/directMessages.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActiveUserService {
  activeUser!: any;
  activeUserChannels!: Channel[];
  activeUserDirectMessages!: DirectMessage[];

  constructor(
    private firestoreService: FirestoreService
  ) {}

  async loadActiveUser(activeUserID?: string) {
    let userID: any = '';

    if (!activeUserID) {
      userID = this.getActiveUserFromLocalStorage();
    } else {
      userID = activeUserID;
    }

    const users = await firstValueFrom(this.firestoreService.allUsers$);
    if (users.length > 0) {
      this.activeUser = users.find((user: any) => user.userID == userID);
    }

    this.loadUserChannels(this.activeUser.channels);
    this.loadUserDirectMessages(this.activeUser.directMessages);    
  }

  setActiveUserToLocalStorage(userID: string) {
    localStorage.setItem('activeUser', userID);
  }

  getActiveUserFromLocalStorage() {
    const userID = localStorage.getItem('activeUser');
    return userID;
  }

  loadUserChannels(activeUserChannelIDs: any[]) {
    this.firestoreService.allChannels$.subscribe((channels) => {
      if (channels.length > 0) {
        this.activeUserChannels = this.firestoreService.allChannels.filter(
          (channel: any) => activeUserChannelIDs.includes(channel.channelID)
        );
      }
    });
  }

  loadUserDirectMessages(activeUserDirectMessageIDs: any[]) {
    this.firestoreService.allDirectMessages$.subscribe((directMessages) => {
      if (directMessages.length > 0) {
        this.activeUserDirectMessages = this.firestoreService.allDirectMessages.filter(
            (directMessage: any) => activeUserDirectMessageIDs.includes(directMessage.directMessageID)
          );
      }
    });
  }
}
