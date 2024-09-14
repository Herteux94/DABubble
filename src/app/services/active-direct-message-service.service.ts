import { Injectable, OnDestroy } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { first, map, Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActiveUserService } from './active-user.service';
import { FindUserService } from './find-user.service';

@Injectable({
  providedIn: 'root',
})
export class ActiveDirectMessageService implements OnDestroy {
  private destroy$ = new Subject<void>(); // Subject to handle unsubscription
  private dmMessageSubscription: Subscription | null = null; // Subscription für Direktnachrichten-Nachrichten
  private activeDMSubscription: Subscription | null = null; // Subscription für die aktive Direktnachricht

  activeDM: any;
  activeDMPartner!: any;
  dmMessages$!: Observable<any[]>;
  dmMessagesGroupedByDate: any[] = [];

  /**
   * Constructor for the ActiveDirectMessageService.
   *
   * Subscribes to the activeChannel$ and loads the channel members when a new channel is selected.
   * @param firestoreService Injected service to interact with Firestore.
   * @param activeUserService Injected service to get the currently active user.
   * @param findUserService Injected service to find other users.
   */
  constructor(
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService,
    private findUserService: FindUserService
  ) {}

  /**
   * Loads the active direct message and its messages and partner.
   *
   * Loads the active direct message and its messages by calling the loadActiveDM and loadDMMessages methods.
   * @param directMessageID The ID of the direct message to be loaded.
   */
  async loadActiveDMAndMessagesAndPartner(directMessageID: string) {
    await this.loadActiveDM(directMessageID);
    this.loadDMMessages(directMessageID);
  }

  /**
   * Loads the active direct message.
   *
   * Subscribes to the activeUserDirectMessages$ and waits for the direct message with the given ID to be available.
   * When it is, it calls setActiveDMAndLoadActiveDMPartner to set the active direct message and load the partner information.
   * @param directMessageID The ID of the direct message to be loaded.
   */
  async loadActiveDM(directMessageID: string): Promise<void> {
    this.unsubPreviousActiveDM();
    this.activeDMSubscription = this.activeUserService.activeUserDirectMessages$
      .pipe(
        first((directMessages) =>
          directMessages.some(
            (directMessage) => directMessage.directMessageID === directMessageID
          )
        ),
        map((directMessages) =>
          directMessages.find(
            (directMessage) => directMessage.directMessageID === directMessageID
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (directMessage) => {
          this.setActiveDMAndLoadActiveDMPartner(
            directMessage,
            directMessageID
          );
        },
        error: (error) => {
          console.error('Unable to load active directMessage:', error);
        },
      });
  }

  /**
   * Sets the active direct message and loads the partner information.
   *
   * @param directMessage The direct message to be set as active.
   * @param directMessageID The ID of the direct message to be set as active.
   */
  setActiveDMAndLoadActiveDMPartner(
    directMessage: any,
    directMessageID: string
  ) {
    if (directMessage) {
      if (this.activeDM?.directMessageID === directMessageID) {
        return;
      }
      this.activeDM = directMessage;
      if (
        directMessage.member.length > 1 &&
        directMessage.directMessageID !=
          this.activeUserService.activeUser.userID
      ) {
        this.loadActiveDMPartner();
      } else {
        this.activeDMPartner = null;
      }
    }
  }

  /**
   * Unsubscribes from the previous active direct message subscription if it exists.
   *
   * This is necessary to prevent multiple subscriptions to the same observable
   * when the active direct message changes.
   */
  unsubPreviousActiveDM() {
    if (this.activeDMSubscription) {
      this.activeDMSubscription.unsubscribe();
      this.activeDMSubscription = null;
    }
  }

  /**
   * Loads the messages of the given direct message.
   *
   * Unsubscribes from the previous DM messages subscription if it exists,
   * sets the DM messages observable to the given direct message ID,
   * and subscribes to it.
   * When the subscription emits a new value, it sorts the messages by date
   * and sets the grouped messages by date.
   *
   * @param directMessageID The ID of the direct message to load its messages.
   */
  loadDMMessages(directMessageID: string) {
    this.unsubPreviousDMMessages();
    this.setDMMessagesObservable(directMessageID);
    this.dmMessageSubscription = this.dmMessages$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messages) => {
          this.sortMessagesAndSetGroupMessagesByDate(messages);
        },
        error: (error) => {
          console.error('Unable to load DM messages:', error);
        },
      });
  }

  /**
   * Unsubscribes from the previous DM messages subscription if it exists.
   *
   * This is necessary to prevent multiple subscriptions to the same observable
   * when the active direct message changes.
   */
  unsubPreviousDMMessages() {
    if (this.dmMessageSubscription) {
      this.dmMessageSubscription.unsubscribe();
      this.dmMessageSubscription = null;
    }
  }

  /**
   * Sets the DM messages observable to the messages of the given direct message ID.
   *
   * @param directMessageID The ID of the direct message to load its messages.
   */
  setDMMessagesObservable(directMessageID: string) {
    this.dmMessages$ = this.firestoreService.getMessages(
      'directMessages',
      directMessageID
    );
  }

  /**
   * Sorts the given messages by their creation time in descending order and
   * groups them by date. It also checks if the messages have changed and only
   * updates the grouped messages if they have. If the messages are the same, it
   * does nothing.
   *
   * @param messages The messages to sort and group.
   */
  sortMessagesAndSetGroupMessagesByDate(messages: any[]) {
    let messagesSorted = [];
    if (messages) {
      messagesSorted = messages.sort((a, b) => b.creationTime - a.creationTime);
      if (this.areMessagesSame(messagesSorted, this.dmMessagesGroupedByDate)) {
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
   * Groups the given messages by their date and sets the dmMessagesGroupedByDate property.
   *
   * It iterates over the messages and creates a new property in the groupedMessages object
   * for each unique date. The value of this property is an array of messages with that date.
   * Then it sets the dmMessagesGroupedByDate property to an array of objects with a date
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
    this.dmMessagesGroupedByDate = Object.keys(groupedMessages).map((date) => ({
      date,
      messages: groupedMessages[date],
    }));
  }

  /**
   * Loads the partner of the active direct message.
   *
   * Finds the ID of the partner in the activeDM's member array by excluding the active user's ID.
   * Then it subscribes to the allUsers$ observable and waits for the partner user to be available.
   * When it is, it sets the activeDMPartner property to the partner user.
   */
  async loadActiveDMPartner() {
    const partnerUserID = await this.activeDM.member.find(
      (id: string) => id !== this.activeUserService.activeUser.userID
    );
    this.firestoreService.allUsers$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.activeDMPartner = this.findUserService.findUser(partnerUserID);
      });
  }

  /**
   * Clears the active direct message and unsubscribes from the activeDM and dmMessages observables.
   *
   * This is necessary to prevent multiple subscriptions to the same observable
   * when the active direct message changes.
   */
  clearActiveDM() {
    if (this.activeDMSubscription) {
      this.activeDMSubscription.unsubscribe();
    }
    if (this.dmMessageSubscription) {
      this.dmMessageSubscription.unsubscribe();
    }
    this.activeDM = null;
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
    if (this.activeDMSubscription) {
      this.activeDMSubscription.unsubscribe();
    }
    if (this.dmMessageSubscription) {
      this.dmMessageSubscription.unsubscribe();
    }
  }
}
