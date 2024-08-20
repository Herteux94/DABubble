import { Injectable, OnInit } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ActiveChannelService {
  activeChannel: any;
  messages: any;

  constructor(
    private firestoreService: FirestoreService,
    private route: ActivatedRoute
  ) {}

  loadActiveChannelFromFirestoreService(channelID: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
          let channel = this.firestoreService.allChannels.find(
            (channel: any) => channel.channelID == channelID
          );
          this.activeChannel = channel;
          resolve();
      } catch {        
        reject('No channel ID found');
      }
    });
  }

  async loadActiveChannelFromBackend(channelID: string) {    
    let activeChannel = await this.firestoreService.getActiveChannel(channelID);
    this.activeChannel = activeChannel;
    // let messages = await this.firestoreService.getMessagesFromActiveChannel(this.activeChannel.messages);
    // this.messages = messages;
  }


}
