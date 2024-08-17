import { Component, OnInit } from '@angular/core';
import { DateDividerComponent } from '../../shared/messengerSubComponents/date-divider/date-divider.component';
import { MessageComponent } from '../../shared/messengerSubComponents/message/message.component';
import { OwnMessageComponent } from '../../shared/messengerSubComponents/own-message/own-message.component';
import { SubHeaderComponent } from '../../shared/messengerSubComponents/sub-header/sub-header.component';
import { TypeInputFieldComponent } from '../../shared/messengerSubComponents/type-input-field/type-input-field.component';
import { ThreadComponent } from '../thread/thread.component';
import { ActiveChannelService } from '../../services/active-channel.service';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [DateDividerComponent, MessageComponent, OwnMessageComponent, SubHeaderComponent, TypeInputFieldComponent, ThreadComponent],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {

  activeChannelID: any;
  activeChannelObject: any;

  // constructor(private route: ActivatedRoute, private firestoreService: FirestoreService) {
  //   this.route.paramMap.subscribe((paramMap) => {
  //     this.activeChannelID = paramMap.get('id')      
  //   });
  //   console.log(this.activeChannelID);

  //   this.loadActiveChannel(this.activeChannelID);
  //   }

  //   async loadActiveChannel(id: string) {
  //     let channel = await this.firestoreService.getChannel(id);
  //     this.activeChannelObject = channel.data();
  //     console.log(this.activeChannelObject);
  //   }
    
  }




