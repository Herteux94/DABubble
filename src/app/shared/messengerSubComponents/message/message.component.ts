import { Component, inject, Input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ProfileDialogComponent } from '../../../dialogs/profile-dialog/profile-dialog.component';
import { Dialog, DIALOG_DATA, DialogModule } from '@angular/cdk/dialog';
import { RoutingThreadOutletService } from '../../../services/routing-thread-outlet.service';
import { ScreenSizeService } from '../../../services/screen-size-service.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule, CommonModule, MatDialogModule, DialogModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  mobile!: boolean;
  dialog = inject(Dialog);
  
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
    private screenSizeService: ScreenSizeService, private router: Router
  ) {}

  openProfileDialog() {
    this.dialog.open(ProfileDialogComponent, {
      data: { userID: this.message.senderID  }
    });
  }

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

  navigateToThread() {
    if(this.mobile) {
      this.router.navigate(['/messenger/threadM']);
    } else {
      this.router.navigate(['/messenger', {outlets: {thread: ['thread']}}]);
    }

    this.threadRoutingService.openThread();
  }

}
