import { Component, inject, Input } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { ProfileDialogComponent } from '../../../dialogs/profile-dialog/profile-dialog.component';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { RoutingThreadOutletService } from '../../../services/routing-thread-outlet.service';
import { ScreenSizeService } from '../../../services/screen-size-service.service';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { ActiveThreadService } from '../../../services/active-thread-service.service';
import { Message } from '../../../models/message.model';
import { ActiveChannelService } from '../../../services/active-channel.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterModule,
    CommonModule,
    MatDialogModule,
    DialogModule,
  ],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent {
  mobile!: boolean;
  dialog = inject(Dialog);

  @Input() ownMessage!: boolean;
  @Input() isChannel!: boolean;
  @Input() message!: Message;

  constructor(
    public threadRoutingService: RoutingThreadOutletService,
    private screenSizeService: ScreenSizeService,
    private router: Router,
    private activeThreadService: ActiveThreadService,
    private activeChannelService: ActiveChannelService
  ) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });

    // Filtere ungültige URLs aus den Anhängen heraus
    if (this.message && this.message.attachments) {
      this.message.attachments = this.message.attachments.filter(
        (url) => url && url.trim() !== ''
      );
    } else {
      console.log('keine Message attachments vorhanden');
    }
  }

  openProfileDialog() {
    this.dialog.open(ProfileDialogComponent, {
      data: { userID: this.message.senderID },
    });
  }

  navigateToThread() {
    // this.activeThreadService.loadActiveThreadAndMessages(
    //   this.message.messageID
    // );
    // if (this.mobile) {
    //   this.router.navigate([
    //     // `/messenger/channel/${this.activeChannelService.activeChannel.channelID}/threadM`,
    //     `/messenger/channel/${this.activeChannelService.activeChannel.channelID}/threadM`,
    //     this.message.messageID,
    //   ]);
    // } else {
    //   this.router.navigate([
    //     '/messenger',
    //     { outlets: { thread: ['thread', this.message.messageID] } },
    //   ]);
    // }
    // this.threadRoutingService.openThread();
  }
}
