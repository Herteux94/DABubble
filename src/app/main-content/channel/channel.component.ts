import { Component, OnInit } from '@angular/core';
import { DateDividerComponent } from '../../shared/messengerSubComponents/date-divider/date-divider.component';
import { MessageComponent } from '../../shared/messengerSubComponents/message/message.component';
import { OwnMessageComponent } from '../../shared/messengerSubComponents/own-message/own-message.component';
import { SubHeaderComponent } from '../../shared/messengerSubComponents/sub-header/sub-header.component';
import { TypeInputFieldComponent } from '../../shared/messengerSubComponents/type-input-field/type-input-field.component';
import { ThreadComponent } from '../thread/thread.component';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';


@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [DateDividerComponent, MessageComponent, OwnMessageComponent, SubHeaderComponent, TypeInputFieldComponent, ThreadComponent],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent implements OnInit {

  activeChannel!: any;

  constructor(private route: ActivatedRoute, private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      const activeChannelID = paramMap.get('id');
      if (activeChannelID) {
            let channel = this.firestoreService.allChannels.find((channel: any) => channel.channelID == activeChannelID);
            this.activeChannel = channel;
      }
    });
  }

  }




