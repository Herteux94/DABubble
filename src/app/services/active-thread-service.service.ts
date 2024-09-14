import { Injectable, OnDestroy } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { first, Observable, Subscription, switchMap, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActiveChannelService } from './active-channel.service';

@Injectable({
  providedIn: 'root',
})
export class ActiveThreadService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private threadMessagesSubscription: Subscription | null = null;

  activeThreadMessage: any;
  threadMessages$!: Observable<any[]>;
  threadMessagesGroupedByDate: any[] = [];
  channelID!: string;

  /**
   * Constructor for the ActiveThreadService.
   *
   * @param firestoreService Injected service to interact with Firestore.
   * @param activeChannelService Injected service to get the currently active channel.
   */
  constructor(
    private firestoreService: FirestoreService,
    private activeChannelService: ActiveChannelService
  ) {}

  /**
   * Loads the active thread message and its messages.
   *
   * Checks if an active channel exists and if so, loads the active thread message
   * and its messages by calling the setChannelIDAndActiveThreadMessage and
   * loadThreadMessages methods. If no active channel exists, it calls the
   * getChannelIDAndLoadThreadMessages method to get the channel ID and load the
   * messages.
   * @param threadMessageID The ID of the thread message to be loaded.
   */
  async loadActiveThreadAndMessages(threadMessageID: string): Promise<void> {
    if (this.activeChannelService.activeChannel?.channelID) {
      this.setChannelIDAndActiveThreadMessage(threadMessageID);
      this.loadThreadMessages(threadMessageID);
    } else {
      this.getChannelIDAndLoadThreadMessages(threadMessageID);
    }
  }

  /**
   * Sets the channel ID and loads the active thread message.
   *
   * @param threadMessageID The ID of the thread message to be loaded.
   */
  async setChannelIDAndActiveThreadMessage(threadMessageID: string) {
    this.channelID = this.activeChannelService.activeChannel.channelID;
    this.activeThreadMessage = (
      await this.firestoreService.getThread(
        this.activeChannelService.activeChannel.channelID,
        threadMessageID
      )
    ).data();
  }

  /**
   * Loads the active channel and active thread message and its messages.
   *
   * Subscribes to the activeChannel$ observable and waits until the active channel
   * exists. Then, it sets the channel ID and loads the active thread message by
   * calling the getThread method. When the observable emits the active thread
   * message, it loads the messages of the thread by calling the loadThreadMessages
   * method.
   * @param threadMessageID The ID of the thread message to be loaded.
   */
  getChannelIDAndLoadThreadMessages(threadMessageID: string) {
    this.activeChannelService.activeChannel$
      .pipe(
        first((channel) => !!channel),
        switchMap((channel) => {
          this.channelID = channel!.channelID;
          return this.firestoreService.getThread(
            channel!.channelID,
            threadMessageID
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (activeThread) => {
          this.activeThreadMessage = activeThread.data();
          this.loadThreadMessages(threadMessageID);
        },
        error: (error) => {
          console.error('Unable to load active thread:', error);
        },
      });
  }

  /**
   * Loads the messages of the active thread message with the given threadMessageID.
   *
   * Unsubscribes from the previous thread messages subscription if it exists,
   * sets the thread messages observable to the given threadMessageID,
   * and subscribes to it.
   * When the subscription emits a new value, it sorts the messages by date
   * and sets the grouped messages by date.
   * @param threadMessageID The ID of the thread message to load its messages.
   */
  async loadThreadMessages(threadMessageID: string) {
    this.unsubPreviousThreadMessages();
    this.setThreadMessagesObservable(threadMessageID);
    this.threadMessagesSubscription = this.threadMessages$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messages) => {
          this.sortMessagesAndSetGroupMessagesByDate(messages);
        },
        error: (error) => {
          console.error('Unable to load active thread messages:', error);
        },
      });
  }

  /**
   * Unsubscribes from the previous thread messages subscription if it exists.
   *
   * This is necessary to prevent multiple subscriptions to the same observable
   * when the active thread changes.
   */
  unsubPreviousThreadMessages() {
    if (this.threadMessagesSubscription) {
      this.threadMessagesSubscription.unsubscribe();
    }
  }

  /**
   * Sets the thread messages observable to the given threadMessageID.
   *
   * @param threadMessageID The ID of the thread message to load its messages.
   */
  setThreadMessagesObservable(threadMessageID: string) {
    this.threadMessages$ = this.firestoreService.getThreadMessages(
      this.channelID,
      threadMessageID
    );
  }

  /**
   * Sorts the given messages by their creation time in ascending order and
   * groups them by date. It also checks if the messages have changed and only
   * updates the grouped messages if they have. If the messages are the same, it
   * does nothing.
   * @param messages The messages to sort and group.
   */
  sortMessagesAndSetGroupMessagesByDate(messages: any[]) {
    let messagesSorted = [];
    if (messages) {
      messagesSorted = messages.sort((a, b) => a.creationTime - b.creationTime);
      if (
        this.areMessagesSame(messagesSorted, this.threadMessagesGroupedByDate)
      ) {
        return;
      }
      this.groupMessagesByDate(messagesSorted);
    }
  }

  /**
   * Checks if the given new messages are the same as the given old messages.
   *
   * Compares the length of the arrays first and returns false if they differ.
   * Then it compares the messageID of each message and returns false if there
   * is a mismatch. If all messageIDs match, it returns true.
   * @param newMessages The new messages to compare with the old messages.
   * @param oldMessages The old messages to compare with the new messages.
   * @returns True if the messages are the same, false otherwise.
   */
  areMessagesSame(newMessages: any[], oldMessages: any[]): boolean {
    if (newMessages.length !== oldMessages.length) {
      return false;
    }
    for (let i = 0; i < newMessages.length; i++) {
      if (newMessages[i].messageID !== oldMessages[i].messages[0].messageID) {
        return false;
      }
    }
    return true;
  }

  /**
   * Groups the given messages by their date and sets the threadMessagesGroupedByDate property.
   *
   * It iterates over the messages and creates a new property in the groupedMessages object
   * for each unique date. The value of this property is an array of messages with that date.
   * Then it sets the threadMessagesGroupedByDate property to an array of objects with a date
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
    this.threadMessagesGroupedByDate = Object.keys(groupedMessages).map(
      (date) => ({
        date,
        messages: groupedMessages[date],
      })
    );
  }

  /**
   * Unsubscribes from the thread messages subscription when the component is destroyed.
   *
   * This is needed to prevent memory leaks when the component is destroyed and
   * recreated.
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.threadMessagesSubscription) {
      this.threadMessagesSubscription.unsubscribe();
    }
  }
}
