import { Component, inject, Input, OnInit } from '@angular/core';
import { ScreenSizeService } from '../../../services/screen-size-service.service';
import { Dialog, DIALOG_DATA, DialogModule } from '@angular/cdk/dialog';
import { InviteMemberDialogComponent } from '../../../dialogs/invite-member-dialog/invite-member-dialog.component';
import { ChannelMemberDialogComponent } from '../../../dialogs/channel-member-dialog/channel-member-dialog.component';
import { ProfileDialogComponent } from '../../../dialogs/profile-dialog/profile-dialog.component';
import { ChannelDialogComponent } from '../../../dialogs/channel-dialog/channel-dialog.component';
import { RoutingThreadOutletService } from '../../../services/routing-thread-outlet.service';
import { ActiveChannelService } from '../../../services/active-channel.service';
import { ActiveDirectMessageService } from '../../../services/active-direct-message-service.service';

export interface DialogData {
  animal: 'panda' | 'unicorn' | 'lion'; // Natürlich noch brauchbare daten anlegen
}

@Component({
  selector: 'app-sub-header',
  standalone: true,
  imports: [DialogModule],
  templateUrl: './sub-header.component.html',
  styleUrl: './sub-header.component.scss',
})
export class SubHeaderComponent implements OnInit {
  dialog = inject(Dialog);
  mobile!: boolean;

  @Input() isChannel!: boolean;
  @Input() isThread!: boolean;
  @Input() isDM!: boolean;
  @Input() isNewMsg!: boolean;

  constructor(
    public screenSizeService: ScreenSizeService,
    public threadRoutingService: RoutingThreadOutletService,
    public activeChannelService: ActiveChannelService,
    public activeDirectMessageService: ActiveDirectMessageService
  ) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });

    if (
      this.activeChannelService.activeChannel &&
      this.activeChannelService.activeChannel.name
    ) {
      this.threadRoutingService.loadActiveThreadChannelName();
    }
  }

  openMemberDialog() {
    this.dialog.open(ChannelMemberDialogComponent, {
      // minWidth: '300px',
      // data: {
      //   animal: 'panda',
      //  panelClass: 'custom-dialog-container'
      // },
    });
  }

  openInviteDialog() {
    this.dialog.open(InviteMemberDialogComponent, {});
  }

  openProfileDialog() {
    this.dialog.open(ProfileDialogComponent, {});
  }

  openChannelDialog() {
    this.dialog.open(ChannelDialogComponent, {});
  }

  closeThread() {
    if (this.mobile) {
      history.back();
    } else {
      this.threadRoutingService.closeThread();
    }
  }
}
