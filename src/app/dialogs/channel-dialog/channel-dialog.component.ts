import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { InviteMemberDialogComponent } from '../invite-member-dialog/invite-member-dialog.component';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { EditMemberDialogComponent } from '../edit-member-dialog/edit-member-dialog.component';
import { Channel } from '../../models/channel.model';
import { ActiveChannelService } from '../../services/active-channel.service';
import { FirestoreService } from '../../services/firestore.service';
import { ActiveUserService } from '../../services/active-user.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { FindUserService } from '../../services/find-user.service';

@Component({
  selector: 'app-channel-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule, InviteMemberDialogComponent],
  templateUrl: './channel-dialog.component.html',
  styleUrl: './channel-dialog.component.scss',
  animations: [
    trigger('dialogAnimationFadeIn', [
      state('void', style({ opacity: 0, transform: 'scale(0.3)' })),
      state('*', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void => *', [animate('300ms ease-out')]),
      transition('* => void', [animate('200ms ease-in')]),
    ]),
    trigger('inputAnimationFadeIn', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void => *', [animate('300ms ease-out')]),
      transition('* => void', [animate('200ms ease-in')]),
    ]),
  ],
})
export class ChannelDialogComponent implements OnInit {
  findUserService = inject(FindUserService);
  dialogRef = inject(DialogRef);
  dialog = inject(Dialog);
  channel!: Channel;
  isTriggered: boolean = false;
  isEditingName: boolean = false;
  isEditingDescription: boolean = false;
  channelName: string = this.activeChannelService.activeChannel.name;
  channelDescription: string =
    this.activeChannelService.activeChannel.description;
  channelCreator: string = this.activeChannelService.activeChannel.creator;
  mobile: boolean = false;
  members: User[] = [];
  @ViewChild('channelNameInput') channelNameInput!: ElementRef;
  @ViewChild('channelDescriptionInput') channelDescriptionInput!: ElementRef;

  /**
   * Constructor for the ChannelDialogComponent.
   *
   * @param screenSizeService Injected service to check for screen size.
   * @param activeChannelService Injected service to get the currently active channel.
   * @param firestoreService Injected service to interact with Firestore.
   * @param activeUserService Injected service to get the currently active user.
   * @param router Injected service to navigate to other routes.
   */
  constructor(
    private screenSizeService: ScreenSizeService,
    public activeChannelService: ActiveChannelService,
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService,
    private router: Router
  ) {}

  /**
   * Lifecycle hook that is called after the component is initialized.
   * It checks for the screen size and loads the user data.
   */
  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
    this.loadUserData();
  }

  /**
   * Toggles the editing of the channel name.
   *
   * If the channel name is being edited, it will stop editing and save the new name.
   * If the channel name is not being edited, it will start editing and focus the input.
   */
  toggleEditName() {
    this.isEditingName = !this.isEditingName;
    if (this.isEditingName) {
      setTimeout(() => {
        this.channelNameInput.nativeElement.focus();
      }, 10);
    } else if (!this.isEditingName) {
      this.saveNewName();
    }
  }

  /**
   * Toggles the editing of the channel description.
   *
   * If the channel description is being edited, it will stop editing and save the new description.
   * If the channel description is not being edited, it will start editing and focus the input.
   */

  /**
   * Toggles the editing of the channel description.
   *
   * If the channel description is being edited, it will stop editing and save the new description.
   * If the channel description is not being edited, it will start editing and focus the input.
   */
  toggleEditDescription() {
    this.isEditingDescription = !this.isEditingDescription;
    if (this.isEditingDescription) {
      setTimeout(() => {
        this.channelDescriptionInput.nativeElement.focus();
      }, 10);
    } else if (!this.isEditingName) {
      this.saveNewDescription();
    }
  }

  /**
   * Loads the user data for the members of the active channel.
   *
   * It uses the `FindUserService` to find the users in the `member` array of the active channel.
   */
  loadUserData() {
    this.members = this.findUserService.findUsers(
      this.activeChannelService.activeChannel.member
    );
  }

  /**
   * Adjusts the number of rows of a textarea element based on its content.
   *
   * It sets the rows property of the textarea element to 1, calculates the
   * current number of rows based on the scrollHeight of the element, and then
   * sets the rows property to the calculated value if it is less than or equal
   * to 4. Otherwise, it sets the rows property to 4.
   * @param textarea The textarea element to adjust.
   */
  adjustTextareaRows(textarea: HTMLTextAreaElement): void {
    textarea.rows = 1;
    const lineHeight = 24;
    const currentRows = Math.floor(textarea.scrollHeight / lineHeight);
    textarea.rows = currentRows <= 4 ? currentRows : 4;
  }

  /**
   * Returns the given userID.
   *
   * This function is currently only used as a placeholder, because the actual
   * user data is not yet displayed in the channel dialog.
   * @param userID The user ID to return.
   * @returns The given user ID.
   */
  getUserData(userID: string) {
    return userID;
  }

  /**
   * Saves the new channel name to the Firestore database.
   *
   * Updates the `name` field of the active channel in the Firestore database
   * with the value of the `channelName` property.
   */
  saveNewName() {
    this.activeChannelService.activeChannel.name = this.channelName;
    this.firestoreService.updateChannel(
      { name: this.channelName },
      this.activeChannelService.activeChannel.channelID
    );
  }

  /**
   * Saves the new channel description to the Firestore database.
   *
   * Updates the `description` field of the active channel in the Firestore database
   * with the value of the `channelDescription` property.
   */
  saveNewDescription() {
    this.activeChannelService.activeChannel.description =
      this.channelDescription;
    this.firestoreService.updateChannel(
      { description: this.channelDescription },
      this.activeChannelService.activeChannel.channelID
    );
  }

  /**
   * Stops the propagation of the given event.
   *
   * This is necessary to prevent the event from bubbling up to the parent
   * component and causing unwanted side effects.
   * @param event The event to stop propagating.
   */
  onEvent(event: Event) {
    event.stopPropagation();
  }

  /**
   * Opens the EditMemberDialogComponent to edit the members of the active
   * channel.
   */
  openEditMemberDialog() {
    this.dialog.open(EditMemberDialogComponent);
  }

  /**
   * Removes the currently active user from the currently active channel.
   *
   * Updates the `member` field of the active channel in the Firestore database
   * to remove the currently active user's ID from the array of member IDs.
   * Also updates the `channels` field of the active user in the Firestore
   * database to remove the active channel's ID from the array of channel IDs.
   * Finally, navigates to the HelloComponent.
   */
  leaveChannel() {
    const userID = this.activeUserService.activeUser.userID;
    const channel = this.activeChannelService.activeChannel;

    const updatedMembers = channel.member.filter(
      (memberID: string) => memberID !== userID
    );
    const updatedUserChannels =
      this.activeUserService.activeUser.channels.filter(
        (channelID: string) => channelID !== channel.channelID
      );

    this.firestoreService.updateChannel(
      { member: updatedMembers },
      channel.channelID
    );
    this.firestoreService.updateUser({ channels: updatedUserChannels }, userID);
    this.navigateToHelloComponent();
  }

  /**
   * Navigates to the HelloComponent.
   *
   * This function is used as a callback after the user has left a channel.
   */
  navigateToHelloComponent() {
    this.router.navigate(['messenger/hello']);
  }
}
