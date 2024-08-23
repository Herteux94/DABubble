import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Channel } from '../models/channel.model';
import { DirectMessage } from '../models/directMessages.model';
import { firstValueFrom, map, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})

export class ActiveUserService {
  activeUser$!: Observable<any>;
  activeUserChannels!: Channel[]; // muss abonnieren für immer aktuellen for loop
  activeUserDirectMessages!: DirectMessage[];
  activeUser!: User;

  constructor(private firestoreService: FirestoreService) {
    this.loadActiveUser();

    // Abonniere den activeUser$-Stream, um Channels und DirectMessages zu laden, wenn sich der User ändert
    this.activeUser$.subscribe((user) => {
      if (user) {
        this.activeUser = user;
        // Lade die Channels und Direct Messages für den aktiven Benutzer
        this.loadUserChannels(this.activeUser.channels);
        this.loadUserDirectMessages(this.activeUser.directMessages);
      }
    });
  }

  async loadActiveUser(activeUserID?: string) {
    let userID: string | null = '';

    if (!activeUserID) {
      userID = this.getActiveUserIDFromLocalStorage();
      console.log('Active User ID über Local Storage geladen: ', userID);
    } else {
      userID = activeUserID;
    }

    await this.getActiveUser(userID); // Stellt sicher, dass der activeUser$ aktualisiert wird

    console.log('Active User: ', this.activeUser$);
  }

  async getActiveUser(userID: string | null) {
    // Setzt den Stream für den aktiven Benutzer auf
    this.activeUser$ = this.firestoreService.allUsers$
      .pipe(
        map(users => users.find((user: any) => user.userID === userID))
      );
  }

  setActiveUserToLocalStorage(userID: string) {
    localStorage.setItem('activeUser', userID);
  }

  getActiveUserIDFromLocalStorage() {
    return localStorage.getItem('activeUser');
  }

  async loadUserChannels(activeUserChannelIDs: string[]) {
    const channels = await firstValueFrom(this.firestoreService.allChannels$);
    if (channels.length > 0) {
      this.activeUserChannels = this.firestoreService.allChannels.filter(
        (channel: any) => activeUserChannelIDs.includes(channel.channelID)
      );
    }
    console.log('Active User Channels: ', this.activeUserChannels);
  }

  async loadUserDirectMessages(activeUserDirectMessageIDs: any[]) {
    const directMessages = await firstValueFrom(this.firestoreService.allDirectMessages$);
    if (directMessages.length > 0) {
      this.activeUserDirectMessages =
        this.firestoreService.allDirectMessages.filter((directMessage: any) =>
          activeUserDirectMessageIDs.includes(directMessage.directMessageID)
        );
    }
    console.log('Active User DMs: ', this.activeUserDirectMessages);
  }
}