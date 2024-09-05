import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { DIALOG_DATA, DialogModule, DialogRef } from '@angular/cdk/dialog';
import { Component, ElementRef, Inject, inject, ViewChild } from '@angular/core';
import { ActiveUserService } from '../../services/active-user.service';
import { FindUserService } from '../../services/find-user.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [CommonModule, RouterModule, DialogModule, FormsModule],
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
  editingProfile = false;
  userName: string = this.activeUserService.activeUser.name;
  userMail: string = this.activeUserService.activeUser.email;
  
  @ViewChild('profileContainer') profileContainer!: ElementRef;
  @ViewChild('userNameInput') userNameInput!: ElementRef;
  @ViewChild('userMail') userMailInput!: ElementRef;
  constructor(
    @Inject(DIALOG_DATA) public data: {userID: string},
    public activeUserService: ActiveUserService,
    public findUserService: FindUserService,
    private firestoreService: FirestoreService,
  ) {}

  ngOnInit(): void {
    this.user = this.findUserService.findUser(this.data.userID);
    this.ownProfile = this.activeUserService.activeUser.userID === this.data.userID;
    
    if (this.ownProfile) {
      console.log('This is the own profile view');
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
        this.profileContainer.nativeElement.focus();
      }, 10);
  }

  toggleEditProfile() {
    this.editingProfile = !this.editingProfile;
  }

  saveChanges() {
    this.firestoreService.updateUser(
      { name: this.userName,
        email: this.userMail
       },
      this.activeUserService.activeUser.userID
    );
    this.dialogRef.close();
  }

}
