import { Component, OnInit, Inject } from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { CommonModule } from '@angular/common';
import { InviteMemberDialogComponent } from '../invite-member-dialog/invite-member-dialog.component';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-channel-member-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './channel-member-dialog.component.html',
  styleUrl: './channel-member-dialog.component.scss'
})
export class ChannelMemberDialogComponent implements OnInit {
  invite : boolean = false;
  mobile: boolean = false;
  contactData = {
    name: '',
  };
  constructor(private screenSizeService: ScreenSizeService) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }
  onSubmit(ngForm: NgForm) {}
  openInvite() {
    this.invite = true;
  }
  // openInviteMemberDialog() {
  //   this.dialogService.openDialog(InviteMemberDialogComponent);
  // }
}
