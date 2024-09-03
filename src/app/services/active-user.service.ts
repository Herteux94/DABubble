import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Channel } from '../models/channel.model';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { FindUserService } from './find-user.service';
import { Router } from '@angular/router';
import { DirectMessage } from '../models/directMessages.model';

@Injectable({
  providedIn: 'root',
})
export class ActiveUserService {
  activeUser!: any;

  // activeUserChannels$!: Observable<Channel[]>;
  activeUserChannels!: Channel[];

  activeUserDirectMessages$!: Observable<DirectMessage[]>;
  activeUserDirectMessages!: any[];

  private activeUserChannelsSubject = new BehaviorSubject<any[]>([]); // Initialisiere mit leerem Array
  activeUserChannels$ = this.activeUserChannelsSubject.asObservable(); // Observable für den Zugriff

  constructor(
    private firestoreService: FirestoreService,
    private findUserService: FindUserService,
    private router: Router
  ) {
    this.loadActiveUser();
  }

  loadActiveUser(activeUserID?: string) {
    this.getActiveUser(this.getActiveUserID(activeUserID));
  }

  getActiveUserID(activeUserID: string | undefined) {
    let userID: any;

    if (!activeUserID) {
      userID = this.getActiveUserIDFromLocalStorage();
      console.log('Active User ID über Local Storage geladen: ', userID);
      userID = activeUserID;
    } else {
      userID = activeUserID;
    }

    return userID;
  }

  getActiveUser(userID: string | null): void {
    this.firestoreService.allUsers$
      .pipe(
        map((users: User[]) =>
          users.find((user: User) => user.userID === userID)
        )
      )
      .subscribe((user: User | undefined) => {
        this.activeUser = user;
        if ((this.activeUser = user)) {
          this.loadConversations();
        }
      });
  }

  loadConversations() {
    this.loadUserChannels(this.activeUser.channels);
    this.loadUserDirectMessages(this.activeUser.directMessages);
  }

  loadUserChannels(activeUserChannelIDs: string[]) {
    this.activeUserChannels$ =
      this.firestoreService.getChannels(activeUserChannelIDs);

    this.activeUserChannels$.subscribe((channels) => {
      this.activeUserChannels = channels;
      this.activeUserChannelsSubject.next(channels);
    });
  }

  async loadUserDirectMessages(activeUserDirectMessageIDs: string[]) {
    this.activeUserDirectMessages$ = this.firestoreService.getDirectMessages(
      activeUserDirectMessageIDs
    );
    this.activeUserDirectMessages$.subscribe((directMessages) => {
      this.activeUserDirectMessages = directMessages;
      this.loadDMPartnerInformations();
    });
  }

  loadDMPartnerInformations() {
    this.firestoreService.allUsers$.subscribe((allUsers) => {
      for (const directMessage of this.activeUserDirectMessages) {
        const partnerUserID = directMessage.member.find(
          (id: string) => id !== this.activeUser.userID
        );
        if (partnerUserID) {
          const partnerUser = allUsers.find(
            (user: User) => user.userID === partnerUserID
          );
          if (partnerUser) {
            directMessage.partnerUser = partnerUser; // Füge den Partner-User der DirectMessage hinzu
          }
        }
      }
    });
  }

  // loadDMPartnerInformations() {
  //   for (const directMessage of this.activeUserDirectMessages) {
  //     const partnerUserID = directMessage.member.find(
  //       (id: string) => id !== this.activeUser.userID
  //     );
  //     if (partnerUserID) {
  //       try {
  //         const partnerUser = this.findUserService.findUser(partnerUserID);
  //         if (partnerUser) {
  //           directMessage.partnerUser = partnerUser; // Füge den Partner-User dem DirectMessage hinzu
  //         }
  //       } catch (error) {
  //         console.error('Fehler beim Laden des Partners', error);
  //       }
  //     }
  //   }
  // }

  setActiveUserToLocalStorage(userID: string) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('activeUser', userID);
      }
    } catch (error) {
      console.error('Fehler beim Setzen von localStorage:', error);
    }
  }

  getActiveUserIDFromLocalStorage() {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('activeUser');
      }
      return null;
    } catch (error) {
      console.error('Fehler beim Abrufen von localStorage:', error);
      return null;
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
