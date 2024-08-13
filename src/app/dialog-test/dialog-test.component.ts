import { Component } from '@angular/core';
import { ChannelMemberDialogComponent } from '../dialogs/channel-member-dialog/channel-member-dialog.component';
import { CreateMemberDialogComponent } from '../dialogs/create-member-dialog/create-member-dialog.component';
import { EditMemberDialogComponent } from '../dialogs/edit-member-dialog/edit-member-dialog.component';
import { InviteMemberDialogComponent } from '../dialogs/invite-member-dialog/invite-member-dialog.component';
import { MenuDialogComponent } from '../dialogs/menu-dialog/menu-dialog.component';
import { ProfileDialogComponent } from '../dialogs/profile-dialog/profile-dialog.component';
import { ChannelDialogComponent } from '../dialogs/channel-dialog/channel-dialog.component';
import { CreateChannelDialogComponent } from '../dialogs/create-channel-dialog/create-channel-dialog.component';
import { DialogsService } from '../services/dialogs.service';

@Component({
  selector: 'app-dialog-test',
  standalone: true,
  imports: [
    CreateChannelDialogComponent,
    ChannelDialogComponent,
    ChannelMemberDialogComponent,
    CreateMemberDialogComponent,
    EditMemberDialogComponent,
    InviteMemberDialogComponent,
    MenuDialogComponent,
    ProfileDialogComponent
  ],
  templateUrl: './dialog-test.component.html',
  styleUrl: './dialog-test.component.scss'
})
export class DialogTestComponent {

  constructor(private dialogService: DialogsService) { }
  mobile: any;

  openInviteMemberDialog() {
    this.dialogService.openDialog(InviteMemberDialogComponent);
  }
}
