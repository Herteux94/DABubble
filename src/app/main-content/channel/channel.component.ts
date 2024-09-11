import { Component, OnDestroy, OnInit } from '@angular/core';
import { DateDividerComponent } from '../../shared/messengerSubComponents/date-divider/date-divider.component';
import { MessageComponent } from '../../shared/messengerSubComponents/message/message.component';
import { SubHeaderComponent } from '../../shared/messengerSubComponents/sub-header/sub-header.component';
import { TypeInputFieldComponent } from '../../shared/messengerSubComponents/type-input-field/type-input-field.component';
import { ThreadComponent } from '../thread/thread.component';
import { ActivatedRoute } from '@angular/router';
import { ActiveChannelService } from '../../services/active-channel.service';
import { ActiveUserService } from '../../services/active-user.service';
import { FirestoreService } from '../../services/firestore.service';
import { CommonModule } from '@angular/common';
import { serverTimestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [
    DateDividerComponent,
    MessageComponent,
    SubHeaderComponent,
    TypeInputFieldComponent,
    ThreadComponent,
    CommonModule,
  ],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss',
})
export class ChannelComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    public activeChannelService: ActiveChannelService,
    public activeUserService: ActiveUserService,
    public firestoreService: FirestoreService
  ) {}

  ngOnInit() {
    console.log(serverTimestamp());

    if (!this.activeChannelService.activeChannel) {
      let channelID: any;
      this.route.paramMap.subscribe((paramMap) => {
        channelID = paramMap.get('id');
      });
      this.activeChannelService.loadActiveChannelAndMessages(channelID);
    }
  }

  ngOnDestroy(): void {
    this.activeChannelService.clearActiveChannel();
  }
}
