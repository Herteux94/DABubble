import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { first, Observable, switchMap } from 'rxjs';
import { Message } from '../models/message.model';
import { ActiveChannelService } from './active-channel.service';

@Injectable({
  providedIn: 'root',
})
export class ActiveThreadService {
  activeThreadMessage: any;
  threadMessages$!: Observable<any[]>;
  threadMessages: Message[] = [];

  channelID!: string;

  constructor(
    private firestoreService: FirestoreService,
    private activeChannelService: ActiveChannelService
  ) {}

  async loadActiveThreadAndMessages(threadMessageID: string): Promise<void> {
    if (
      this.activeChannelService.activeChannel &&
      this.activeChannelService.activeChannel.channelID
    ) {
      this.channelID = this.activeChannelService.activeChannel.channelID;

      this.activeThreadMessage = (
        await this.firestoreService.getThread(
          this.activeChannelService.activeChannel.channelID,
          threadMessageID
        )
      ).data();
      this.loadThreadMessages(threadMessageID);
    } else {
      this.activeChannelService.activeChannel$
        .pipe(
          first((channel) => !!channel),
          switchMap((channel) => {
            this.channelID = channel!.channelID;
            return this.firestoreService.getThread(
              channel!.channelID,
              threadMessageID
            );
          })
        )
        .subscribe({
          next: (activeThread) => {
            this.activeThreadMessage = activeThread.data();
            this.loadThreadMessages(threadMessageID);
          },
          error: (error) => {
            console.error('Fehler beim Laden des aktiven Threads:', error);
          },
        });
    }
  }

  async loadThreadMessages(threadMessageID: string) {
    this.threadMessages$ = this.firestoreService.getThreadMessages(
      this.channelID,
      threadMessageID
    );

    this.threadMessages$.subscribe({
      next: (messages) => {
        if (messages) {
          this.threadMessages = messages.sort(
            (a, b) => a.creationTime - b.creationTime
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
}
