import {
  // AfterViewChecked,
  // ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  shouldScrollToBottom: boolean = true;

  constructor(
    private route: ActivatedRoute,
    public activeChannelService: ActiveChannelService,
    public activeUserService: ActiveUserService,
    public firestoreService: FirestoreService
  ) {}

  ngOnInit() {
    if (!this.activeChannelService.activeChannel) {
      let channelID: any;
      this.route.paramMap.subscribe((paramMap) => {
        channelID = paramMap.get('id');
      });
      this.activeChannelService.loadActiveChannelAndMessages(channelID);
    }
  }

  // ngAfterViewChecked() {
  //   if (this.messageContainer) {
  //     this.scrollToBottom();
  //   }
  // }

  // scrollToBottom() {
  //   if (this.messageContainer) {
  //     try {
  //       this.messageContainer.nativeElement.scrollTop =
  //         this.messageContainer.nativeElement.scrollHeight;
  //     } catch (err) {
  //       console.error('Could not scroll to bottom:', err);
  //     }
  //   }
  // }

  ngOnDestroy(): void {
    this.activeChannelService.clearActiveChannel();
  }
}
