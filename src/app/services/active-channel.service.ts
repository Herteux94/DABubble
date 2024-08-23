import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { first, map, Observable } from 'rxjs';
import { channel } from 'diagnostics_channel';

@Injectable({
  providedIn: 'root',
})
export class ActiveChannelService {
  activeChannel: any;
  channelMessages$!: Observable<any[]>;

  channelMessages: any[] = [];

  constructor(
    private firestoreService: FirestoreService,
  ) {}

  async loadActiveChannelAndMessages(channelID: string) {
    await this.loadActiveChannel(channelID);
    this.loadChannelMessages(channelID);
  }

  async loadActiveChannel(channelID: string): Promise<void> {
    this.firestoreService.allChannels$
      .pipe(
        first(channels => channels.some(channel => channel.channelID === channelID)),
        map(channels => channels.find(channel => channel.channelID === channelID))
      )
      .subscribe({
        next: (channel) => {
          if (channel) {
            this.activeChannel = channel; 
            console.log(this.activeChannel);

          } else {
            console.error('Channel nicht gefunden');
          }
        },
        error: (error) => {
          console.error('Fehler beim Laden des aktiven Channels:', error);
        },
        complete: () => {
          console.log('Channel-Ladevorgang abgeschlossen.');
        }
      });      
  }

  loadChannelMessages(channelID: string) {
    this.channelMessages$ = this.firestoreService.getMessages('channels', channelID);
    this.channelMessages$.subscribe({
      next: (messages) => {
        if (messages) {
          console.log(messages);
          
          this.channelMessages = messages; 
          console.log(this.channelMessages);

        } else {
          console.error('Messages nicht gefunden');
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der aktiven Messages:', error);
      },
      complete: () => {
        console.log('Messages-Ladevorgang abgeschlossen.');
      }
    });      
  }


}
