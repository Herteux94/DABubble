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
import { ActiveUserService } from '../../../services/active-user.service';

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
  ownMessage!: boolean;

  @Input() isChannel!: boolean;
  @Input() message!: {
    senderID: string;
    senderName: string;
    creationTime: Number;
    content: string;
    attachments: string[];
    reactions: string[];
    messageID: string;
  };

  constructor(
    public threadRoutingService: RoutingThreadOutletService,
    private screenSizeService: ScreenSizeService,
    private router: Router,
    private activeUserService: ActiveUserService
  ) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });

    this.checkIfOwnMessage();

    // Filtere ungültige URLs aus den Anhängen heraus
    if (this.message.attachments) {
      this.message.attachments = this.message.attachments.filter(
        (url) => url && url.trim() !== ''
      );
    }
  }

  checkIfOwnMessage() {
    if (this.message.senderID == this.activeUserService.activeUser.userID) {
      this.ownMessage = true;
    } else {
      this.ownMessage = false;
    }
  }

  openProfileDialog() {
    this.dialog.open(ProfileDialogComponent, {
      data: { userID: this.message.senderID },
    });
  }

  navigateToThread() {
    if (this.mobile) {
      this.router.navigate(['/messenger/threadM']);
    } else {
      this.router.navigate(['/messenger', { outlets: { thread: ['thread'] } }]);
    }

    this.threadRoutingService.openThread();
  }
}
