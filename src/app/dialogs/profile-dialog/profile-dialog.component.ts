import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Dialog,
  DIALOG_DATA,
  DialogModule,
  DialogRef,
} from '@angular/cdk/dialog';
import {
  Component,
  ElementRef,
  Inject,
  inject,
  ViewChild,
} from '@angular/core';
import { ActiveUserService } from '../../services/active-user.service';
import { FindUserService } from '../../services/find-user.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { NewDirectMessageService } from '../../services/new-direct-message.service';
import { ChooseAvatarComponent } from '../../authentication/choose-avatar/choose-avatar.component';

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
  newDirectMessageService = inject(NewDirectMessageService);
  dialogRef = inject(DialogRef);
  dialog = inject(Dialog);
  user!: any;
  ownProfile: boolean = false;
  editingProfile = false;
  userName: string = this.activeUserService.activeUser.name;
  userMail: string = this.activeUserService.activeUser.email;

  @ViewChild('profileContainer') profileContainer!: ElementRef;
  @ViewChild('userNameInput') userNameInput!: ElementRef;
  @ViewChild('userMail') userMailInput!: ElementRef;

  /**
   * Constructor for the ProfileDialogComponent.
   *
   * @param data the user to show in the dialog, given as an object with a userID property
   * @param activeUserService the service to get the active user from
   * @param findUserService the service to find users with
   * @param firestoreService the service to perform Firestore operations with
   * @param router the router to navigate with
   */
  constructor(
    @Inject(DIALOG_DATA) public data: { userID: string },
    public activeUserService: ActiveUserService,
    public findUserService: FindUserService,
    private firestoreService: FirestoreService,
    private router: Router
  ) {}

  /**
   * Lifecycle hook that is called after the component is initialized.
   *
   * It sets the user property to the user found with the given userID and
   * checks if the current user is viewing their own profile.
   */
  ngOnInit(): void {
    this.user = this.findUserService.findUser(this.data.userID);
    this.ownProfile =
      this.activeUserService.activeUser.userID === this.data.userID;
  }

  /**
   * Lifecycle hook that is called after the component's view has been fully initialized.
   *
   * It focuses the profile container element after a short delay.
   */
  ngAfterViewInit() {
    setTimeout(() => {
      this.profileContainer.nativeElement.focus();
    }, 10);
  }

  /**
   * Toggles the editing of the profile.
   *
   * It switches the editingProfile flag, resets the user name and mail to the
   * current active user's name and mail, and focuses the profile container
   * element after a short delay.
   */
  toggleEditProfile() {
    this.editingProfile = !this.editingProfile;
    this.userName = this.activeUserService.activeUser.name;
    this.userMail = this.activeUserService.activeUser.email;
  }

  /**
   * Saves the changes made to the user profile and closes the dialog.
   *
   * It updates the user document in the Firestore database with the new
   * name and email, and then closes the dialog.
   */
  saveChanges() {
    this.firestoreService.updateUser(
      { name: this.userName, email: this.userMail },
      this.activeUserService.activeUser.userID
    );
    this.dialogRef.close();
  }

  /**
   * Opens a direct message with the given user.
   *
   * It first checks if a direct message with the user already exists.
   * If it does, it navigates to the direct message.
   * If it doesn't, it creates a new direct message and navigates to it.
   * The dialog is then closed.
   * @param user The user to open a direct message with.
   */
  async openDM(user: User): Promise<void> {
    const directMessages =
      this.activeUserService.activeUserDirectMessages || [];

    const existingDM = directMessages.find((dm) =>
      dm.member.includes(user.userID)
    );
    if (existingDM) {
      this.navigateToDM(existingDM);
    } else {
      this.addDirectMessageAndNavigate(user)
    }
    this.dialogRef.close();
  }

  /**
   * Navigates to the given direct message.
   * @param existingDM The direct message to navigate to.
   */
  navigateToDM(existingDM: any) {
    this.router.navigate([
      `messenger/directMessage/${existingDM.directMessageID}`,
    ]);
  }

  /**
   * Creates a new direct message with the given user and navigates to it.
   *
   * Sets the message receiver of the NewDirectMessageService to the given user,
   * creates a new direct message with the service, and then navigates to the
   * newly created direct message.
   * @param user The user to create a new direct message with.
   */
  async addDirectMessageAndNavigate(user: User) {
    this.newDirectMessageService.messageReceiver = user;
      const newDirectMessageID =
        await this.newDirectMessageService.addNewDirectMessage();
      this.router.navigate([`messenger/directMessage/${newDirectMessageID}`]);
  }

  /**
   * Opens the ChooseAvatarDialog as a dialog.
   *
   * Opens the ChooseAvatarDialog with the isDialog flag set to true.
   * This dialog is used to let the user choose an avatar when viewing their own profile.
   */
  openAvatarDialog() {
    this.dialog.open(ChooseAvatarComponent, {
      data: { isDialog: true },
    });
  }
}
