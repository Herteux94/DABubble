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

  /**
   * Constructor for the ActiveUserService.
   *
   * Subscribes to the activeUserChannels$ and activeUserDirectMessages$ observables and loads the active user's channels and direct messages when it is created.
   * @param firestoreService Injected service to interact with Firestore.
   * @param router Injected service to navigate within the app.
   */
  constructor(
    private firestoreService: FirestoreService,
    private router: Router
  ) {
    if (!this.activeUser) {
      this.loadActiveUser();
    }
  }

  /**
   * Loads the active user and its channels and direct messages.
   *
   * Subscribes to the activeUserChannels$ and activeUserDirectMessages$ observables and loads the active user's channels and direct messages when it is called.
   * If an active user ID is provided, it loads the active user with the given ID. Otherwise, it loads the active user from local storage.
   * @param activeUserID The ID of the active user to load.
   */
  loadActiveUser(activeUserID?: string) {
    this.getActiveUser(this.getActiveUserID(activeUserID));
  }

  /**
   * Returns the active user ID.
   *
   * If an active user ID is provided, it returns the given ID. Otherwise, it returns the active user ID from local storage.
   * @param activeUserID The ID of the active user to return. If not provided, the active user ID from local storage is returned.
   * @returns The active user ID.
   */
  getActiveUserID(activeUserID: string | undefined) {
    let userID: string | null;
    if (!activeUserID) {
      userID = this.getActiveUserIDFromLocalStorage();
    } else {
      userID = activeUserID;
    }
    return userID;
  }

  /**
   * Loads the active user with the given ID and its channels and direct messages.
   *
   * Subscribes to the allUsers$ observable and filters the users by the given ID.
   * When the observable emits a new value, it assigns the user with the given ID to the activeUser property.
   * If the activeUser property is set, it calls the loadConversations method to load the active user's channels and direct messages.
   * @param userID The ID of the active user to load.
   */
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

  /**
   * Loads the active user's channels and direct messages.
   *
   * Calls the loadUserChannels and loadUserDirectMessages methods to load the active user's channels and direct messages.
   */
  loadConversations() {
    this.loadUserChannels(this.activeUser.channels);
    this.loadUserDirectMessages(this.activeUser.directMessages);
  }

  /**
   * Loads the active user's channels from the Firestore database.
   *
   * Subscribes to the getChannels observable and passes the activeUserChannelIDs array.
   * When the observable emits a new value, it assigns the channels to the activeUserChannels property
   * and updates the activeUserChannelsSubject with the new channels.
   * @param activeUserChannelIDs The IDs of the channels to be loaded.
   */
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

  /**
   * Loads the active user's direct messages from the Firestore database.
   *
   * Subscribes to the getDirectMessages observable and passes the activeUserDirectMessageIDs array.
   * When the observable emits a new value, it assigns the direct messages to the activeUserDirectMessages property
   * and updates the activeUserDirectMessagesSubject with the new direct messages.
   * Additionally, it loads the partner information for the direct messages.
   * @param activeUserDirectMessageIDs The IDs of the direct messages to be loaded.
   */
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

  /**
   * Loads the partner information for the active user's direct messages.
   *
   * Subscribes to the allUsers$ observable and waits for the list of all users to be available.
   * When it is, it loops through the activeUserDirectMessages array and finds the partner user ID
   * for each direct message by excluding the active user's ID from the direct message's member array.
   * Then it finds the partner user object in the allUsers array and assigns it to the direct message's
   * partnerUser property.
   */
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

  /**
   * Sets the active user ID to local storage.
   *
   * Tries to set the active user ID to local storage. If an error occurs, it logs the error.
   * @param userID The ID of the user to be set as active user.
   */
  setActiveUserToLocalStorage(userID: string) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('activeUser', userID);
      }
    } catch (error) {
      console.error('Unable to set active user to localStorage:', error);
    }
  }

  /**
   * Retrieves the active user ID from local storage.
   *
   * Tries to retrieve the active user ID from local storage. If an error occurs, it logs the error.
   * @returns The active user ID if it exists, otherwise null.
   */
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

  /**
   * Logs out the currently active user.
   *
   * Removes the active user ID from local storage, updates the active user in Firestore
   * to be inactive, resets the active user channels and direct messages subjects and
   * properties, and navigates to the login page.
   */
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

  /**
   * Unsubscribes from the active user channels and direct messages subscriptions when the component is destroyed.
   *
   * This is needed to prevent memory leaks when the component is destroyed and recreated.
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
