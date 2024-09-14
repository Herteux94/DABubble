import { Injectable, OnDestroy } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil, first, map } from 'rxjs/operators';
import { ActiveUserService } from './active-user.service';
import { User } from '../models/user.model';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActiveChannelService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private messageSubscription: Subscription | null = null;
  private activeChannelSubscription: Subscription | null = null;
  private lastLoadedChannelID: string | null = null;
  private lastLoadedMessages: any[] = [];

  activeChannelSubject = new BehaviorSubject<any>(null);
  activeChannel$ = this.activeChannelSubject.asObservable();
  activeChannel: any = null;
  channelMessages$!: Observable<any[]>;
  channelMessagesGroupedByDate: any[] = [];
  channelMember: User[] = [];

  /**
   * Constructor for the ActiveChannelService.
   *
   * Subscribes to the activeChannel$ and loads the channel members when a new channel is selected.
   * @param firestoreService Injected service to interact with Firestore.
   * @param activeUserService Injected service to get the currently active user.
   */
  constructor(
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService
  ) {
    this.activeChannel$.pipe(takeUntil(this.destroy$)).subscribe((channel) => {
      this.activeChannel = channel;
      if (channel) {
        this.loadChannelMember();
      }
    });
  }

  /**
   * Loads the active channel with the given channelID and its messages.
   *
   * First, it calls loadActiveChannel to load the channel and then it calls
   * loadChannelMessages to load the messages of the channel.
   * @param channelID The ID of the channel to be loaded.
   */
  async loadActiveChannelAndMessages(channelID: string) {
    await this.loadActiveChannel(channelID);
    this.loadChannelMessages(channelID);
  }

  /**
   * Loads the active channel with the given channelID.
   *
   * Subscribes to the activeUserChannels$ observable and waits until the active user
   * has at least one channel. Then, it maps the channels array to the channel with
   * the given channelID and unsubscribes the previous active channel subscription.
   * Finally, it subscribes to the mapped observable and updates the activeChannelSubject
   * with the new channel when it is received.
   * @param channelID The ID of the channel to be loaded.
   */
  async loadActiveChannel(channelID: string): Promise<void> {
    this.unsubPreviousActiveChannel();
    this.activeChannelSubscription = this.activeUserService.activeUserChannels$
      .pipe(
        first((channels) => channels.length > 0),
        map((channels) =>
          channels.find((channel) => channel.channelID === channelID)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (channel) => {
          if (channel && this.activeChannel?.channelID !== channel.channelID) {
            this.activeChannelSubject.next(channel);
          }
        },
        error: (error) => {
          console.error('Unable to load active Channel:', error);
        },
      });
  }

  /**
   * Unsubscribes from the previous active channel subscription if it exists.
   *
   * This is necessary to prevent multiple subscriptions to the same observable
   * when the active channel changes.
   */
  unsubPreviousActiveChannel() {
    if (this.activeChannelSubscription) {
      this.activeChannelSubscription.unsubscribe();
      this.activeChannelSubscription = null;
    }
  }

  /**
   * Loads the members of the currently active channel into the channelMember property.
   *
   * Subscribes to the allUsers$ observable and filters the users by the member IDs
   * of the active channel. The subscription is unsubscribed when the component is destroyed.
   */
  loadChannelMember() {
    if (this.activeChannel && this.activeChannel.member) {
      const userIDs = this.activeChannel.member;
      this.firestoreService.allUsers$
        .pipe(
          map((users) => users.filter((user) => userIDs.includes(user.userID))),
          takeUntil(this.destroy$)
        )
        .subscribe((channelMember) => {
          this.channelMember = channelMember;
        });
    }
  }

  /**
   * Loads the messages of the given channel ID.
   *
   * Unsubscribes from the previous channel messages subscription if it exists,
   * sets the channel messages observable to the given channel ID,
   * and subscribes to it.
   * When the subscription emits a new value, it sorts the messages by date
   * and sets the grouped messages by date.
   * If the same channel ID is loaded again, it does nothing.
   * @param channelID The ID of the channel to load its messages.
   */
  loadChannelMessages(channelID: string) {
    this.unsubPreviousChannelMessages();
    if (this.lastLoadedChannelID === channelID) {
      return;
    }
    this.setChannelMessagesObservable(channelID);
    this.messageSubscription = this.channelMessages$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messages) => {
          this.sortMessagesAndSetGroupMessagesByDate(messages, channelID);
        },
        error: (error) => {
          console.error('Unable to load active channel messages:', error);
        },
      });
  }

  /**
   * Unsubscribes from the previous channel messages subscription if it exists.
   *
   * This is necessary to prevent multiple subscriptions to the same observable
   * when the active channel changes.
   */
  unsubPreviousChannelMessages() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = null;
    }
  }

  /**
   * Sets the channelMessages$ observable to the messages of the channel with the given ID.
   *
   * This is used to load the messages of the active channel.
   * @param channelID The ID of the channel to load the messages from.
   */
  setChannelMessagesObservable(channelID: string) {
    this.channelMessages$ = this.firestoreService.getMessages(
      'channels',
      channelID
    );
  }

  /**
   * Sorts the given messages by their creation time in descending order and
   * groups them by date. It also checks if the messages have changed and only
   * updates the grouped messages if they have. If the messages are the same, it
   * does nothing.
   *
   * @param messages The messages to sort and group.
   * @param channelID The ID of the channel to load the messages from.
   */
  sortMessagesAndSetGroupMessagesByDate(messages: any[], channelID: string) {
    let messagesSorted = [];
    if (messages) {
      const isMessagesChanged = this.haveMessagesChanged(messages);
      if (!isMessagesChanged) {
        return;
      }
      messagesSorted = messages.sort((a, b) => b.creationTime - a.creationTime);
      this.groupMessagesByDate(messagesSorted);
      this.lastLoadedChannelID = channelID;
      this.lastLoadedMessages = messages;
    }
  }

  /**
   * Checks if the given array of messages is different from the last loaded messages.
   *
   * It compares the length of the arrays first and returns true if they differ.
   * If the lengths are equal, it checks if at least one message has a different creation time.
   * @param newMessages The new messages to compare with the last loaded messages.
   * @returns True if the messages have changed, false otherwise.
   */
  haveMessagesChanged(newMessages: any[]): boolean {
    if (newMessages.length !== this.lastLoadedMessages.length) {
      return true;
    }

    return newMessages.some(
      (msg, index) =>
        msg.creationTime !== this.lastLoadedMessages[index].creationTime
    );
  }

  /**
   * Groups the given messages by their date and sets the channelMessagesGroupedByDate property.
   *
   * It iterates over the messages and creates a new property in the groupedMessages object
   * for each unique date. The value of this property is an array of messages with that date.
   * Then it sets the channelMessagesGroupedByDate property to an array of objects with a date
   * and an array of messages for that date.
   * @param messages The messages to group by date.
   */
  groupMessagesByDate(messages: any[]) {
    const groupedMessages: { [key: string]: any[] } = {};
    let date: any;
    messages.forEach((message) => {
      if (message?.creationTime?.seconds) {
        date = new Date(
          message.creationTime.seconds * 1000
        ).toLocaleDateString();
      }
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message);
    });
    this.channelMessagesGroupedByDate = Object.keys(groupedMessages).map(
      (date) => ({
        date,
        messages: groupedMessages[date],
      })
    );
  }

  /**
   * Unsubscribes from the active channel messages subscription and from the active channel subscription.
   *
   * This is necessary to prevent multiple subscriptions to the same observable
   * when the active channel changes.
   */
  clearActiveChannel() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = null;
    }
    if (this.activeChannelSubscription) {
      this.activeChannelSubscription.unsubscribe();
      this.activeChannelSubscription = null;
    }
  }

  /**
   * Cleanup method to unsubscribe from all observables
   *
   * This method is called automatically when the component is destroyed.
   * It unsubscribes from the active channel subscription and the channel messages subscription
   * to prevent memory leaks.
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.activeChannelSubscription) {
      this.activeChannelSubscription.unsubscribe();
    }
  }
}
