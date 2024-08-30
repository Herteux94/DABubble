import { computed, effect, Injectable, OnDestroy, Signal } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Channel } from '../models/channel.model';
import { DirectMessage } from '../models/directMessages.model';
import { firstValueFrom, map, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { FindUserService } from './find-user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ActiveUserService implements OnDestroy {
  activeUser$!: Observable<any>;
  // activeUserChannels!: Channel[];
  activeUserDirectMessages!: any[];
  activeUser!: User;

  allChannels: Signal<any[]> = toSignal(this.firestoreService.allChannels$);

  // Signal für aktive Kanäle des Benutzers
  activeUserChannels!: Signal<any[]>;

  // Effekt, der auf Änderungen von allChannels reagiert
  private activeUserChannelsEffect = effect(() => {
    const channels = this.allChannels();
    if (channels.length > 0) {
      this.activeUserChannels = computed(() =>
        channels.filter((channel: any) =>
          this.activeUser.channels.includes(channel.channelID)
        )
      );
    }
  });

  constructor(
    private firestoreService: FirestoreService,
    private findUserService: FindUserService,
    private router: Router
  ) {
    this.loadActiveUser();
  }

  ngOnDestroy() {
    // Effekt deaktivieren, um Speicherlecks zu vermeiden
    this.activeUserChannelsEffect.destroy();
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

    this.subscribeUserObservableAndLoadConversations();
  }

  async getActiveUser(userID: string | null) {
    this.activeUser$ = this.firestoreService.allUsers$.pipe(
      map((users) => users.find((user: any) => user.userID === userID))
    );
  }

  subscribeUserObservableAndLoadConversations() {
    this.activeUser$.subscribe((user) => {
      this.activeUser = user;
      // this.loadUserChannels(this.activeUser.channels);
      this.loadUserDirectMessages(this.activeUser.directMessages);
    });
  }

  setActiveUserToLocalStorage(userID: string) {
    localStorage.setItem('activeUser', userID);
  }

  getActiveUserIDFromLocalStorage() {
    return localStorage.getItem('activeUser');
  }

  // async loadUserChannels(activeUserChannelIDs: string[]): Observable<any[]> { // als Promise deklarieren
  //   const channels = await firstValueFrom(this.firestoreService.allChannels$);
  //   if (channels.length > 0) {
  //     this.activeUserChannels = this.firestoreService.allChannels.filter(
  //       (channel: any) => activeUserChannelIDs.includes(channel.channelID)
  //     );
  //   }
  // }

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
    // this.activeUserChannels = [];
    this.activeUserDirectMessages = [];

    // Leite zur Login-Seite weiter
    this.router.navigate(['/login']);
  }
}
function toSignal(allChannels$: Observable<Channel[]>): Signal<any[]> {
  throw new Error('Function not implemented.');
}
