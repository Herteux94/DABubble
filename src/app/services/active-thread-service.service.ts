import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Observable } from 'rxjs';
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
    const channelID = this.activeChannelService.activeChannel.channelID;

    const activeThread = this.firestoreService.getThread(
      channelID,
      threadMessageID
    );

    this.activeThreadMessage = (await activeThread).data();
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
