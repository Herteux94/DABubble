import { Injectable, OnDestroy } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil, first, map } from 'rxjs/operators';
import { Message } from '../models/message.model';
import { ActiveUserService } from './active-user.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ActiveChannelService implements OnDestroy {
  private destroy$ = new Subject<void>(); // Used to signal unsubscription

  activeChannelSubject = new BehaviorSubject<any>(null); // Initial null value
  activeChannel$ = this.activeChannelSubject.asObservable(); // Expose as observable
  activeChannel: any = null; // Maintain the latest channel as a plain object
  channelMessages$!: Observable<any[]>;
  channelMessages: Message[] = [];
  channelMember: User[] = [];

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
    this.activeUserService.activeUserChannels$
      .pipe(
        first((channels) => channels.length > 0),
        map((channels) =>
          channels.find((channel) => channel.channelID === channelID)
        ),
        takeUntil(this.destroy$) // Ensure unsubscription
      )
      .subscribe({
        next: (channel) => {
          if (channel) {
            this.activeChannelSubject.next(channel);
          } else {
            console.error('Channel nicht gefunden');
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
    this.channelMessages$ = this.firestoreService.getMessages(
      'channels',
      channelID
    );
    this.channelMessages$
      .pipe(takeUntil(this.destroy$)) // Ensure unsubscription
      .subscribe({
        next: (messages) => {
          if (messages) {
            this.channelMessages = messages.sort(
              (a, b) => b.creationTime - a.creationTime
            );
          } else {
            console.error('Messages nicht gefunden');
          }
        },
        error: (error) => {
          console.error('Fehler beim Laden der aktiven Messages:', error);
        },
      });
  }

  clearActiveChannel() {
    this.activeChannelSubject.next(null);
    this.activeChannel = null;
  }

  // Clean up all subscriptions
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
