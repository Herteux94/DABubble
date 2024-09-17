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

  /**
   * Constructor for the ActiveUserService.
   *
   * Injects the FirestoreService and Router.
   * If the activeUser is not set, it calls loadActiveUser.
   * @param firestoreService Injected service to interact with Firestore.
   * @param router Injected service to navigate to a thread.
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
   * Loads the active user with the given activeUserID.
   *
   * If no activeUserID is given, it loads the active user from localStorage.
   * @param activeUserID The ID of the user to be loaded.
   */
  loadActiveUser(activeUserID?: string) {
    this.getActiveUser(this.getActiveUserID(activeUserID));
  }

  /**
   * Returns the ID of the user to be loaded as the active user.
   *
   * If no activeUserID is given, it loads the active user from localStorage.
   * @param activeUserID The ID of the user to be loaded.
   * @returns The ID of the user to be loaded as the active user.
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
   * Loads the active user with the given userID from Firestore.
   *
   * Subscribes to the allUsers$ observable and loads the user when the observable emits a new value.
   * When a user is found, it assigns the user to the activeUser property and calls loadConversations.
   * The subscription is automatically unsubscribed when the service is destroyed.
   * @param userID The ID of the user to be loaded.
   */
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

  /**
   * Loads the conversations of the active user.
   *
   * Calls loadUserChannels and loadUserDirectMessages with the channel and direct message IDs
   * of the active user, respectively.
   */
  loadConversations() {
    this.loadUserChannels(this.activeUser.channels);
    this.loadUserDirectMessages(this.activeUser.directMessages);
  }

  /**
   * Loads the channels of the active user with the given IDs.
   *
   * Subscribes to the getChannels observable and loads the channels when the observable emits a new value.
   * When a channel is found, it assigns the channel to the activeUserChannels property and calls
   * activeUserChannelsSubject.next with the channels.
   * The subscription is automatically unsubscribed when the service is destroyed.
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

    this.unsubscribePrevious('channels');
    const sub = this.firestoreService
      .getChannels(activeUserChannelIDs)
      .subscribe((channels) => {
        this.activeUserChannels = channels;
        this.activeUserChannelsSubject.next(channels);
      });
    this.subscriptions.push({ name: 'channels', sub });
  }

  /**
   * Loads the direct messages of the active user with the given IDs.
   *
   * Subscribes to the getDirectMessages observable and loads the direct messages when the observable emits a new value.
   * When a direct message is found, it assigns the direct message to the activeUserDirectMessages property and calls
   * activeUserDirectMessagesSubject.next with the direct messages.
   * The subscription is automatically unsubscribed when the service is destroyed.
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

  /**
   * Loads the partner information of the active user's direct messages.
   *
   * Unsubscribes from the previous DM partner subscription if it exists,
   * subscribes to the allUsers$ observable and loads the partner information
   * when the observable emits a new value. When a partner user is found, it
   * assigns the partner user to the partnerUser property of the direct message.
   * The subscription is automatically unsubscribed when the service is destroyed.
   */
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

  /**
   * Sets the active user ID in localStorage.
   *
   * Tries to set the active user ID in localStorage, but does nothing if it fails.
   * @param userID The ID of the user to be set as the active user.
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
   * Returns the active user ID from localStorage.
   *
   * Tries to get the active user ID from localStorage, but returns null if it fails.
   * @returns The active user ID from localStorage, or null.
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
   * Logs out the active user.
   *
   * Unsubscribes from all observables, removes the active user from localStorage,
   * updates the user's active status in Firestore, resets the active user and
   * their channels/direct messages, and navigates to the login page.
   */
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

  /**
   * Unsubscribes from the subscription with the given name if it exists.
   *
   * Finds the subscription with the given name in the subscriptions array,
   * unsubscribes from it, and removes it from the array.
   * @param name The name of the subscription to unsubscribe from.
   */
  private unsubscribePrevious(name: string) {
    const subIndex = this.subscriptions.findIndex((s) => s.name === name);
    if (subIndex !== -1) {
      this.subscriptions[subIndex].sub.unsubscribe();
      this.subscriptions.splice(subIndex, 1);
    }
  }

  /**
   * Unsubscribes from all subscriptions and clears the subscriptions array.
   *
   * This is used in the ngOnDestroy lifecycle hook to prevent memory leaks
   * when the component is destroyed and recreated.
   */
  private unsubscribeAll() {
    this.subscriptions.forEach((s) => s.sub.unsubscribe());
    this.subscriptions = [];
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   *
   * Unsubscribes from all subscriptions to prevent memory leaks when the
   * component is destroyed and recreated.
   */
  ngOnDestroy() {
    this.unsubscribeAll();
  }
}
