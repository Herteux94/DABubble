import { Component, inject, OnInit } from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { CommonModule } from '@angular/common';
import { Dialog, DialogRef, DIALOG_DATA, DialogModule } from '@angular/cdk/dialog';
import { ProfileDialogComponent } from '../profile-dialog/profile-dialog.component';
import { User } from '../../models/user.model';
import { ActiveUserService } from '../../services/active-user.service';

@Component({
  selector: 'app-menu-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-dialog.component.html',
  styleUrl: './menu-dialog.component.scss'
})
export class MenuDialogComponent implements OnInit {
  dialogRef = inject(DialogRef);
  dialog = inject(Dialog);
  user!: User;
  mobile: boolean = false;

  constructor(private screenSizeService: ScreenSizeService, private activeUserService: ActiveUserService) {}

  /**
   * Lifecycle hook that is called after the component is initialized.
   * It checks for the screen size and stores the result in the mobile variable.
   */
  ngOnInit() {
    this.screenSizeService.isMobile().subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }

  /**
   * Opens the profile dialog for the currently active user.
   * It opens a new dialog with the active user as the user to show in the dialog.
   */
  openOwnProfileDialog() {
    this.dialog.open(ProfileDialogComponent, {
      data: { userID: this.activeUserService.activeUser.userID  }
    });
  }

  /**
   * Logs out the current user and closes the dialog.
   * It calls the logout function of the activeUserService and then closes the dialog.
   */
  onLogout() {
    this.activeUserService.logout();
    this.dialogRef.close();
  }
}
