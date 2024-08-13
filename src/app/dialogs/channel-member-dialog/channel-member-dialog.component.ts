import { Component, OnInit } from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { CommonModule } from '@angular/common';
import { DialogsService } from '../../services/dialogs.service';
import { InviteMemberDialogComponent } from '../invite-member-dialog/invite-member-dialog.component';

@Component({
  selector: 'app-channel-member-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel-member-dialog.component.html',
  styleUrl: './channel-member-dialog.component.scss'
})
export class ChannelMemberDialogComponent implements OnInit {

  mobile: boolean = false;

  constructor(private screenSizeService: ScreenSizeService, private dialogService: DialogsService) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }

  openInviteMemberDialog() {
    this.dialogService.openDialog(InviteMemberDialogComponent);
  }
}
