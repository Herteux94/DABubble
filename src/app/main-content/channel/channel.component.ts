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
  /**
   * Constructor for the ChannelComponent.
   *
   * @param route Injected service to get the currently active channel.
   * @param activeChannelService Injected service to get the currently active channel.
   * @param activeUserService Injected service to get the currently active user.
   * @param firestoreService Injected service to interact with Firestore.
   */
  constructor(
    private route: ActivatedRoute,
    public activeChannelService: ActiveChannelService,
    public activeUserService: ActiveUserService,
    public firestoreService: FirestoreService
  ) {}

  /**
   * Lifecycle hook that is called after the component is initialized.
   *
   * It loads the active channel with the given channelID and its messages if
   * the active channel is not already loaded.
   *
   * @remarks
   * This is necessary to prevent the channel from being loaded multiple times
   * when the user navigates to the channel page.
   */
  ngOnInit() {
    if (!this.activeChannelService.activeChannel) {
      let channelID: any;
      this.route.paramMap.subscribe((paramMap) => {
        channelID = paramMap.get('id');
      });
      this.activeChannelService.loadActiveChannelAndMessages(channelID);
    }
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   *
   * Clears the currently active channel to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.activeChannelService.clearActiveChannel();
  }
}
