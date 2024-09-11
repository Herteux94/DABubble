import { Injectable, OnDestroy } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Channel } from '../models/channel.model';
import { BehaviorSubject, map, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from '../models/user.model';
import { FindUserService } from './find-user.service';
import { Router } from '@angular/router';
import { DirectMessage } from '../models/directMessages.model';

@Injectable({
  providedIn: 'root',
})
export class ActiveUserService implements OnDestroy {
  private destroy$ = new Subject<void>(); // Subject to handle unsubscription

  activeUser!: any;

  activeUserChannels!: Channel[];
  private activeUserChannelsSubject = new BehaviorSubject<any[]>([]); // Initialisiere mit leerem Array
  activeUserChannels$ = this.activeUserChannelsSubject.asObservable(); // Observable für den Zugriff

  activeUserDirectMessages!: DirectMessage[];
  private activeUserDirectMessagesSubject = new BehaviorSubject<any[]>([]); // Initialisiere mit leerem Array
  activeUserDirectMessages$ =
    this.activeUserDirectMessagesSubject.asObservable(); // Observable für den Zugriff

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
        takeUntil(this.destroy$) // Ensure unsubscription
      )
      .subscribe((user: User | undefined) => {
        this.activeUser = user;
        if (this.activeUser) {
          // this.activeUser.lastOnline = Date.now();
          this.loadConversations();
        }
      });
  }

  loadConversations() {
    this.loadUserChannels(this.activeUser.channels);
    this.loadUserDirectMessages(this.activeUser.directMessages);
  }

  loadUserChannels(activeUserChannelIDs: string[]) {
    this.firestoreService
      .getChannels(activeUserChannelIDs)
      .pipe(takeUntil(this.destroy$)) // Ensure unsubscription
      .subscribe((channels) => {
        this.activeUserChannels = channels;
        this.activeUserChannelsSubject.next(channels);
      });
  }

  loadUserDirectMessages(activeUserDirectMessageIDs: string[]) {
    this.firestoreService
      .getDirectMessages(activeUserDirectMessageIDs)
      .pipe(takeUntil(this.destroy$)) // Ensure unsubscription
      .subscribe((directMessages) => {
        this.activeUserDirectMessages = directMessages;
        this.activeUserDirectMessagesSubject.next(directMessages);
        this.loadDMPartnerInformations();
      });
  }

  loadDMPartnerInformations() {
    this.firestoreService.allUsers$
      .pipe(takeUntil(this.destroy$)) // Ensure unsubscription
      .subscribe((allUsers) => {
        if (this.activeUserDirectMessages.length > 1) {
          for (const directMessage of this.activeUserDirectMessages) {
            if (
              directMessage.member.length > 1 &&
              this.activeUser.userID != directMessage.directMessageID
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

    this.activeUser = null!;
    this.activeUserChannelsSubject.next([]);
    this.activeUserChannels = [];
    this.activeUserDirectMessagesSubject.next([]);
    this.activeUserDirectMessages = [];

    this.router.navigate(['/login']);
  }

  // Cleanup method to unsubscribe from all observables
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
