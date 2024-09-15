import { Injectable, OnDestroy } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Channel } from '../models/channel.model';
import { BehaviorSubject, map, Subscription } from 'rxjs';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { DirectMessage } from '../models/directMessages.model';

@Injectable({
  providedIn: 'root',
})
export class ActiveUserService implements OnDestroy {
  private subscriptions: { name: string; sub: Subscription }[] = [];

  activeUser!: any;

  activeUserChannels!: Channel[];
  private activeUserChannelsSubject = new BehaviorSubject<any[]>([]);
  activeUserChannels$ = this.activeUserChannelsSubject.asObservable();

  activeUserDirectMessages!: DirectMessage[];
  private activeUserDirectMessagesSubject = new BehaviorSubject<any[]>([]);
  activeUserDirectMessages$ =
    this.activeUserDirectMessagesSubject.asObservable();

  constructor(
    private firestoreService: FirestoreService,
    private router: Router
  ) {
    if (!this.activeUser) {
      this.loadActiveUser();
    }
  }

  loadActiveUser(activeUserID?: string) {
    this.getActiveUser(this.getActiveUserID(activeUserID));
  }

  getActiveUserID(activeUserID: string | undefined) {
    let userID: string | null;
    if (!activeUserID) {
      userID = this.getActiveUserIDFromLocalStorage();
    } else {
      userID = activeUserID;
    }
    return userID;
  }

  getActiveUser(userID: string | null): void {
    this.unsubscribePrevious('activeUser');
    const sub = this.firestoreService.allUsers$
      .pipe(
        map((users: User[]) =>
          users.find((user: User) => user.userID === userID)
        )
      )
      .subscribe((user: User | undefined) => {
        this.activeUser = user;
        if (this.activeUser) {
          this.loadConversations();
        }
      });
    this.subscriptions.push({ name: 'activeUser', sub });
  }

  loadConversations() {
    this.loadUserChannels(this.activeUser.channels);
    this.loadUserDirectMessages(this.activeUser.directMessages);
  }

  loadUserChannels(activeUserChannelIDs: string[]) {
    if (
      this.activeUserChannels &&
      this.activeUserChannels.length === activeUserChannelIDs.length &&
      this.activeUserChannels
        .map((c) => c.channelID)
        .every((id) => activeUserChannelIDs.includes(id))
    ) {
      return;
    }

    this.unsubscribePrevious('channels');
    const sub = this.firestoreService
      .getChannels(activeUserChannelIDs)
      .subscribe((channels) => {
        this.activeUserChannels = channels;
        this.activeUserChannelsSubject.next(channels);
      });
    this.subscriptions.push({ name: 'channels', sub });
  }

  loadUserDirectMessages(activeUserDirectMessageIDs: string[]) {
    if (
      this.activeUserDirectMessages &&
      this.activeUserDirectMessages.length ===
        activeUserDirectMessageIDs.length &&
      this.activeUserDirectMessages
        .map((dm) => dm.directMessageID)
        .every((id) => activeUserDirectMessageIDs.includes(id))
    ) {
      return;
    }

    this.unsubscribePrevious('directMessages');
    const sub = this.firestoreService
      .getDirectMessages(activeUserDirectMessageIDs)
      .subscribe((directMessages) => {
        this.activeUserDirectMessages = directMessages;
        this.activeUserDirectMessagesSubject.next(directMessages);
        this.loadDMPartnerInformations();
      });
    this.subscriptions.push({ name: 'directMessages', sub });
  }

  loadDMPartnerInformations() {
    this.unsubscribePrevious('dmPartners');
    const sub = this.firestoreService.allUsers$.subscribe((allUsers) => {
      if (this.activeUserDirectMessages?.length > 1) {
        for (const directMessage of this.activeUserDirectMessages) {
          if (
            directMessage?.member?.length > 1 &&
            this.activeUser?.userID != directMessage.directMessageID
          ) {
            const partnerUserID = directMessage.member.find(
              (id: string) => id !== this.activeUser.userID
            );
            if (partnerUserID) {
              const partnerUser = allUsers.find(
                (user: User) => user.userID === partnerUserID
              );
              if (partnerUser) {
                directMessage.partnerUser = partnerUser;
              }
            }
          }
        }
      }
    });
    this.subscriptions.push({ name: 'dmPartners', sub });
  }

  setActiveUserToLocalStorage(userID: string) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('activeUser', userID);
      }
    } catch (error) {
      console.error('Unable to set active user to localStorage:', error);
    }
  }

  getActiveUserIDFromLocalStorage() {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('activeUser');
      }
      return null;
    } catch (error) {
      console.error('Unable to get active user from localStorage:', error);
      return null;
    }
  }

  logout() {
    this.unsubscribeAll();
    localStorage.removeItem('activeUser');
    this.firestoreService.updateUser({ active: false }, this.activeUser.userID);
    this.activeUser = null!;
    this.activeUserChannelsSubject.next([]);
    this.activeUserChannels = [];
    this.activeUserDirectMessagesSubject.next([]);
    this.activeUserDirectMessages = [];

    this.router.navigate(['/login']);
  }

  private unsubscribePrevious(name: string) {
    const subIndex = this.subscriptions.findIndex((s) => s.name === name);
    if (subIndex !== -1) {
      this.subscriptions[subIndex].sub.unsubscribe();
      this.subscriptions.splice(subIndex, 1);
    }
  }

  private unsubscribeAll() {
    this.subscriptions.forEach((s) => s.sub.unsubscribe());
    this.subscriptions = [];
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }
}
