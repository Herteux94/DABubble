import { Component, OnInit } from '@angular/core';
import { DateDividerComponent } from '../../shared/messengerSubComponents/date-divider/date-divider.component';
import { MessageComponent } from '../../shared/messengerSubComponents/message/message.component';
import { OwnMessageComponent } from '../../shared/messengerSubComponents/own-message/own-message.component';
import { SubHeaderComponent } from '../../shared/messengerSubComponents/sub-header/sub-header.component';
import { TypeInputFieldComponent } from '../../shared/messengerSubComponents/type-input-field/type-input-field.component';
import { ThreadComponent } from '../thread/thread.component';
import { ActivatedRoute } from '@angular/router';
import { ActiveChannelService } from '../../services/active-channel.service';
import { ActiveUserService } from '../../services/active-user.service';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [
    DateDividerComponent,
    MessageComponent,
    OwnMessageComponent,
    SubHeaderComponent,
    TypeInputFieldComponent,
    ThreadComponent,
  ],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss',
})
export class ChannelComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    public activeChannelService: ActiveChannelService,
    public firestoreService: FirestoreService
  ) {}

  ngOnInit() {
    if (!this.activeChannelService.activeChannel) {
      let channelID: any;
      this.route.paramMap.subscribe((paramMap) => {
        channelID = paramMap.get('id');
      });
      this.activeChannelService.loadActiveChannel(channelID);
    }
  }
}
