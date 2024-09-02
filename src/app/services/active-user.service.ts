import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Channel } from '../models/channel.model';
import { firstValueFrom, map, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { FindUserService } from './find-user.service';
import { Router } from '@angular/router';
import { log } from 'console';

@Injectable({
  providedIn: 'root',
})
export class ActiveUserService {
  activeUser$!: Observable<any>;
  activeUser!: any;
  activeUserChannels!: Channel[];
  activeUserDirectMessages!: any[];

  constructor(
    private firestoreService: FirestoreService,
    private findUserService: FindUserService,
    private router: Router
  ) {
    this.loadActiveUser();
  }

  async loadActiveUser(activeUserID?: string) {
    // if(activeUserID) {
    //   await this.getActiveUser(activeUserID);
    // } else {
    // const activeUserID = await this.getActiveUserIDFromLocalStorage();
    this.activeUser = await this.getActiveUser(
      this.getActiveUserID(activeUserID)
    ); // Stellt sicher, dass der activeUser$ aktualisiert wird
    // }
    console.log(this.activeUser);

    this.subscribeUserObservableAndLoadConversations();
  }

  async getActiveUserID(activeUserID: any) {
    let userID: string | null;

    if (!activeUserID) {
      userID = this.getActiveUserIDFromLocalStorage();
      console.log('Active User ID über Local Storage geladen: ', userID);
    } else {
      userID = activeUserID;
    }

    return userID;
  }

  async getActiveUser(userID: any): Promise<any> {
    const user = await firstValueFrom(
      this.firestoreService.allUsers$.pipe(
        map((users: any[]) => users.find((user: any) => user.userID === userID))
      )
    );

    console.log(user);

    return user;
  }

  subscribeUserObservableAndLoadConversations() {
    this.activeUser$.subscribe((user) => {
      if (user) {
        this.activeUser = user;
        this.loadUserChannels(this.activeUser.channels);
        this.loadUserDirectMessages(this.activeUser.directMessages);
      }
    });
  }

  setActiveUserToLocalStorage(userID: string) {
    localStorage.setItem('activeUser', userID);
  }

  getActiveUserIDFromLocalStorage() {
    return localStorage.getItem('activeUser');
  }

  async loadUserChannels(activeUserChannelIDs: string[]) {
    // const channels = await firstValueFrom(this.firestoreService.allChannels$);
    // if (channels.length > 0) {
    //   this.activeUserChannels = this.firestoreService.allChannels.filter(
    //     (channel: any) => activeUserChannelIDs.includes(channel.channelID)
    //   );
    // }

    this.firestoreService.allChannels$.subscribe(() => {
      this.activeUserChannels = this.firestoreService.allChannels.filter(
        (channel: any) => activeUserChannelIDs.includes(channel.channelID)
      );
    });

    setTimeout(() => {
      console.log('activeUserChannels changed: ', this.activeUserChannels);
    }, 1000);
  }

  async loadUserDirectMessages(activeUserDirectMessageIDs: any[]) {
    const directMessages = await firstValueFrom(
      this.firestoreService.allDirectMessages$
    );
    if (directMessages.length > 0) {
      this.activeUserDirectMessages =
        this.firestoreService.allDirectMessages.filter((directMessage: any) =>
          activeUserDirectMessageIDs.includes(directMessage.directMessageID)
        );

      this.loadDMPartnerInformations();
    }
  }

  loadDMPartnerInformations() {
    if (!this.activeUser || !this.activeUserDirectMessages) return;

    for (const directMessage of this.activeUserDirectMessages) {
      const partnerUserID = directMessage.member.find(
        (id: string) => id !== this.activeUser.userID
      );

      if (partnerUserID) {
        try {
          const partnerUser = this.findUserService.findUser(partnerUserID);

          if (partnerUser) {
            directMessage.partnerUser = partnerUser; // Füge den Partner-User dem DirectMessage hinzu
          }
        } catch (error) {
          console.error('Fehler beim Laden des Partners', error);
        }
      }
    }
  }

  logout() {
    // Leere den Local Storage
    localStorage.removeItem('activeUser');

    // Setze alle relevanten Variablen zurück
    this.activeUser = null!;
    this.activeUserChannels = [];
    this.activeUserDirectMessages = [];

    // Leite zur Login-Seite weiter
    this.router.navigate(['/login']);
  }
}
