import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { first, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActiveChannelService {
  activeChannel: any;

  constructor(
    private firestoreService: FirestoreService,
  ) {}

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
}
