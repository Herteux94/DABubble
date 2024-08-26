import { Component, inject, OnInit } from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { CommonModule } from '@angular/common';
import { Dialog, DialogRef, DIALOG_DATA, DialogModule } from '@angular/cdk/dialog';
import { ProfileDialogComponent } from '../profile-dialog/profile-dialog.component';
import { User } from '../../models/user.model';
import { ActiveUserService } from '../../services/active-user.service';
import { MatDialogModule } from '@angular/material/dialog';


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

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }

  openOwnProfileDialog() {
    this.dialog.open(ProfileDialogComponent, {
      data: { userID: this.activeUserService.activeUser.userID  }
    });
  }
}
