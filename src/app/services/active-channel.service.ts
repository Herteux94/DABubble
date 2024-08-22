import { Injectable, OnInit } from '@angular/core';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root',
})
export class ActiveChannelService {
  activeChannel: any;

  constructor(
    private firestoreService: FirestoreService,
  ) {}

  async loadActiveChannel(channelID: string) { 
    this.firestoreService.allChannels$.subscribe((channels) => { // Standard-Anfrage ans Observable
      if(channels.length > 0) {
        this.activeChannel = this.firestoreService.allChannels.find(
          (channel: any) => channel.channelID == channelID
        );
      }
    });    
  }


}
