import { Injectable, OnDestroy } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil, first, map } from 'rxjs/operators';
import { ActiveUserService } from './active-user.service';
import { User } from '../models/user.model';
import { Subscription } from 'rxjs'; // Importiere Subscription

@Injectable({
  providedIn: 'root',
})
export class ActiveChannelService implements OnDestroy {
  private destroy$ = new Subject<void>(); // Used to signal unsubscription
  private messageSubscription: Subscription | null = null; // Neue Subscription-Variable für Nachrichten
  private activeChannelSubscription: Subscription | null = null; // Subscription für die aktive Direktnachricht

  activeChannelSubject = new BehaviorSubject<any>(null); // Initial null value
  activeChannel$ = this.activeChannelSubject.asObservable(); // Expose as observable
  activeChannel: any = null; // Maintain the latest channel as a plain object
  channelMessages$!: Observable<any[]>;
  channelMessagesGroupedByDate: any[] = [];
  channelMember: User[] = [];

  private lastLoadedChannelID: string | null = null;
  private lastLoadedMessages: any[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService
  ) {
    this.activeChannel$
      .pipe(takeUntil(this.destroy$)) // Unsubscribe when destroy$ emits
      .subscribe((channel) => {
        this.activeChannel = channel;
        if (channel) {
          this.loadChannelMember();
        }
      });
  }

  async loadActiveChannelAndMessages(channelID: string) {
    await this.loadActiveChannel(channelID);
    this.loadChannelMessages(channelID);
  }

  async loadActiveChannel(channelID: string): Promise<void> {
    // Unsubscribe von der vorherigen aktiven DM Subscription (falls vorhanden)
    if (this.activeChannelSubscription) {
      this.activeChannelSubscription.unsubscribe();
      this.activeChannelSubscription = null;
    }
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
          console.error('Fehler beim Laden des aktiven Channels:', error);
        },
      });
  }

  loadChannelMember() {
    if (this.activeChannel && this.activeChannel.member) {
      const userIDs = this.activeChannel.member;
      this.firestoreService.allUsers$
        .pipe(
          map((users) => users.filter((user) => userIDs.includes(user.userID))),
          takeUntil(this.destroy$) // Ensure unsubscription
        )
        .subscribe((channelMember) => {
          this.channelMember = channelMember;
        });
    } else {
      console.warn(
        'Keine Mitglieder im Channel gefunden oder activeChannel ist null.'
      );
    }
  }

  loadChannelMessages(channelID: string) {
    // Bevor neue Nachrichten geladen werden, von vorheriger Subscription unsubscriben
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = null;
    }
    // Überprüfen, ob der ChannelID gleich ist
    if (this.lastLoadedChannelID === channelID) {
      return; // Keine Änderungen, nichts tun
    }

    this.channelMessages$ = this.firestoreService.getMessages(
      'channels',
      channelID
    );
    this.messageSubscription = this.channelMessages$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messages) => {
          let messagesSorted = [];
          if (messages) {
            // Überprüfen, ob sich die Nachrichten geändert haben
            const isMessagesChanged = this.haveMessagesChanged(messages);

            if (!isMessagesChanged) {
              return; // Keine Änderungen, nichts tun
            }

            messagesSorted = messages.sort(
              (a, b) => b.creationTime - a.creationTime
            );
            this.groupMessagesByDate(messagesSorted);

            // ChannelID und Nachrichten speichern
            this.lastLoadedChannelID = channelID;
            this.lastLoadedMessages = messages;
          } else {
            console.error('Messages nicht gefunden');
          }
        },
        error: (error) => {
          console.error('Fehler beim Laden der aktiven Messages:', error);
        },
      });
  }

  // Methode zum Überprüfen, ob sich die Nachrichten geändert haben
  private haveMessagesChanged(newMessages: any[]): boolean {
    if (newMessages.length !== this.lastLoadedMessages.length) {
      return true; // Unterschiedliche Anzahl an Nachrichten
    }

    // Prüfen, ob irgendeine Nachricht sich geändert hat
    return newMessages.some(
      (msg, index) =>
        msg.creationTime !== this.lastLoadedMessages[index].creationTime
    );
  }

  groupMessagesByDate(messages: any[]) {
    const groupedMessages: { [key: string]: any[] } = {};
    let date: any;

    messages.forEach((message) => {
      if (message?.creationTime?.seconds) {
        date = new Date(
          message.creationTime.seconds * 1000
        ).toLocaleDateString(); // Datum aus dem Timestamp extrahieren
      }

      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message); // Nachricht zum richtigen Datum hinzufügen
    });

    this.channelMessagesGroupedByDate = Object.keys(groupedMessages).map(
      (date) => ({
        date,
        messages: groupedMessages[date],
      })
    );
  }

  // Methode, die beim Verlassen des Channels aufgerufen wird
  clearActiveChannel() {
    // Unsubscribe von der aktuellen Nachrichten-Subscription, wenn der Channel verlassen wird
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = null;
    }
    if (this.activeChannelSubscription) {
      this.activeChannelSubscription.unsubscribe();
      this.activeChannelSubscription = null;
    }
    this.activeChannelSubject.next(null); // Setzt den aktiven Channel auf null
    this.activeChannel = null;
  }

  // Clean up all subscriptions
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    // Unsubscribe von den Subscriptions
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.activeChannelSubscription) {
      this.activeChannelSubscription.unsubscribe();
    }
  }
}
