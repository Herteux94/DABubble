import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { DIALOG_DATA, DialogModule, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, inject } from '@angular/core';
import { User } from '../../models/user.model';
import { ActiveUserService } from '../../services/active-user.service';
import { FindUserService } from '../../services/find-user.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { log } from 'console';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [DialogModule],
  templateUrl: './profile-dialog.component.html',
  styleUrl: './profile-dialog.component.scss',
  animations: [
    trigger('dialogAnimationFadeIn', [
      state('void', style({ opacity: 0, transform: 'scale(0.3)' })),
      state('*', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void => *', [animate('300ms ease-out')]),
      transition('* => void', [animate('200ms ease-in')]),
    ]),
  ],
})
export class ProfileDialogComponent {
  dialogRef = inject(DialogRef);
  user!: any;
  ownProfile: boolean = false;

  constructor(
    @Inject(DIALOG_DATA) public data: {userID: string},
    public activeUserService: ActiveUserService,
    public findUserService: FindUserService
  ) {}

  ngOnInit(): void {
    this.user = this.findUserService.findUser(this.data.userID);
    this.ownProfile = this.activeUserService.activeUser.userID === this.data.userID;
    console.log(this.user);
    console.log(this.activeUserService.activeUser.userID);
    
    if (this.ownProfile) {
      console.log('This is the own profile view');
    }
  }
}
