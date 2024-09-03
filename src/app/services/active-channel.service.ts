import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { first, map, Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { ActiveUserService } from './active-user.service';

@Injectable({
  providedIn: 'root',
})
export class ActiveChannelService {
  activeChannel: any;
  channelMessages$!: Observable<any[]>;
  channelMessages: Message[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService
  ) {}

  async loadActiveChannelAndMessages(channelID: string) {
    await this.loadActiveChannel(channelID);
    this.loadChannelMessages(channelID);
  }

  async loadActiveChannel(channelID: string): Promise<void> {
    this.activeUserService.activeUserChannels$
      .pipe(
        first((channels) => channels.length > 0), // Warte, bis Kanäle vorhanden sind
        map((channels) =>
          channels.find((channel) => channel.channelID === channelID)
        )
      )
      .subscribe({
        next: (channel) => {
          if (channel) {
            this.activeChannel = channel;
          } else {
            console.error('Channel nicht gefunden');
          }
        },
        error: (error) => {
          console.error('Fehler beim Laden des aktiven Channels:', error);
        },
      });
  }
  

  // async loadActiveChannel(channelID: string): Promise<void> {
    
  //   if (this.activeUserService.activeUserChannels.length > 0) {
  //     this.activeUserService.activeUserChannels$
  //       .pipe(
  //         first((channels) =>
  //           channels.some((channel) => channel.channelID === channelID)
  //         ),
  //         map((channels) =>
  //           channels.find((channel) => channel.channelID === channelID)
  //         )
  //       )
  //       .subscribe({
  //         next: (channel) => {
  //           if (channel) {
  //             this.activeChannel = channel;
  //           } else {
  //             console.error('Channel nicht gefunden');
  //           }
  //         },
  //         error: (error) => {
  //           console.error('Fehler beim Laden des aktiven Channels:', error);
  //         },
  //       });

  //   }
  // }

  loadChannelMessages(channelID: string) {
    this.channelMessages$ = this.firestoreService.getMessages(
      'channels',
      channelID
    );
    this.channelMessages$.subscribe({
      next: (messages) => {
        if (messages) {
          this.channelMessages = messages.sort(
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
