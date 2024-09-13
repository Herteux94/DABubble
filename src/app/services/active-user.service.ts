import { Injectable, OnDestroy } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Channel } from '../models/channel.model';
import { BehaviorSubject, map, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { DirectMessage } from '../models/directMessages.model';

@Injectable({
  providedIn: 'root',
})
export class ActiveUserService implements OnDestroy {
  private destroy$ = new Subject<void>(); 
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
    this.firestoreService.allUsers$
      .pipe(
        map((users: User[]) =>
          users.find((user: User) => user.userID === userID)
        ),
        takeUntil(this.destroy$) 
      )
      .subscribe((user: User | undefined) => {
        this.activeUser = user;
        if (this.activeUser) {
          this.loadConversations();
        }
      });
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

    this.firestoreService
      .getChannels(activeUserChannelIDs)
      .pipe(takeUntil(this.destroy$)) 
      .subscribe((channels) => {
        this.activeUserChannels = channels;
        this.activeUserChannelsSubject.next(channels);
      });
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

    this.firestoreService
      .getDirectMessages(activeUserDirectMessageIDs)
      .pipe(takeUntil(this.destroy$))
      .subscribe((directMessages) => {
        this.activeUserDirectMessages = directMessages;
        this.activeUserDirectMessagesSubject.next(directMessages);
        this.loadDMPartnerInformations();
      });
  }

  loadDMPartnerInformations() {
    this.firestoreService.allUsers$
      .pipe(takeUntil(this.destroy$)) 
      .subscribe((allUsers) => {
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
  }

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
    localStorage.removeItem('activeUser');

    this.firestoreService.updateUser({ active: false }, this.activeUser.userID);

    this.activeUser = null!;
    this.activeUserChannelsSubject.next([]);
    this.activeUserChannels = [];
    this.activeUserDirectMessagesSubject.next([]);
    this.activeUserDirectMessages = [];

    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
