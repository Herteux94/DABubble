import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { first, firstValueFrom, Observable, switchMap } from 'rxjs';
import { Message } from '../models/message.model';
import { ActiveChannelService } from './active-channel.service';

@Injectable({
  providedIn: 'root',
})
export class ActiveThreadService {
  activeThreadMessage: any;
  threadMessages$!: Observable<any[]>;
  threadMessages: Message[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private activeChannelService: ActiveChannelService
  ) {}

  async loadActiveThreadAndMessages(threadMessageID: string) {
    await this.loadActiveThread(threadMessageID);
    this.loadThreadMessages(threadMessageID);
  }

  async loadActiveThread(threadMessageID: string): Promise<void> {
    if (
      this.activeChannelService.activeChannel &&
      this.activeChannelService.activeChannel.channelID
    ) {
      this.activeThreadMessage = (
        await this.firestoreService.getThread(
          this.activeChannelService.activeChannel.channelID,
          threadMessageID
        )
      ).data();
      console.log(
        'loaded ActiveThread without subscribe: ',
        this.activeThreadMessage
      );
    } else {
      this.activeChannelService.activeChannel$
        .pipe(
          first((channel) => !!channel),
          switchMap((channel) =>
            this.firestoreService.getThread(channel!.channelID, threadMessageID)
          )
        )
        .subscribe({
          next: (activeThread) => {
            this.activeThreadMessage = activeThread.data();
            console.log(
              'loaded ActiveThread WITH Robims subscribe: ',
              this.activeThreadMessage
            );
          },
          error: (error) => {
            console.error('Fehler beim Laden des aktiven Threads:', error);
          },
        });
    }
  }

  async loadThreadMessages(threadMessageID: string) {
    const channelID = this.activeChannelService.activeChannel.channelID;

    this.threadMessages$ = this.firestoreService.getThreadMessages(
      channelID,
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
