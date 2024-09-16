import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { DialogRef } from '@angular/cdk/dialog';
import { Channel } from '../../models/channel.model';
import { FindUserService } from '../../services/find-user.service';
import { ActiveChannelService } from '../../services/active-channel.service';
import { FirestoreService } from '../../services/firestore.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-channel-member-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './channel-member-dialog.component.html',
  styleUrl: './channel-member-dialog.component.scss',
  animations: [
    trigger('dialogAnimationSlideInRight', [
      state('void', style({ transform: 'translateX(100%)', opacity: 0 })),
      state('*', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('void => *', [animate('300ms ease-in')]),
      transition('* => void', [
        animate(
          '300ms ease-out',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class ChannelMemberDialogComponent implements OnInit {
  findUserService = inject(FindUserService);
  activeChannelService = inject(ActiveChannelService);
  dialogRef = inject(DialogRef);
  invite: boolean = false;
  mobile: boolean = false;
  channel!: Channel;
  contactData = {
    name: '',
  };
  members: User[] = [];
  selectedUsers = signal<User[]>([]);

  searchQuery = signal('');
  foundUsers = computed(() =>
    this.findUserService.findUsersWithName(this.searchQuery())
  );

  constructor(
    private screenSizeService: ScreenSizeService,
    public firestoreService: FirestoreService
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
   * Opens the invite dialog for the channel.
   *
   * It sets the `invite` property of the component to `true`, which is used to
   * conditionally render the invite dialog.
   */
  openInvite() {
    this.invite = true;
  }

  /**
   * Adds a user to the selected users array if it is not already there.
   * Sets the search query to an empty string.
   * Calls the showSelectedUsers method to update the UI.
   * @param user The user to add to the selected users array.
   */
  selectUser(user: User) {
    if (!this.selectedUsers().includes(user)) {
      this.selectedUsers.update((users) => [...users, user]);
    }
    this.searchQuery.set('');
    this.showSelectedUsers();
  }

  /**
   * Returns the users that have been selected by the user.
   * @returns The selected users as an array of User objects.
   */
  showSelectedUsers() {
    const users = this.selectedUsers();
    return users;
  }

  /**
   * Updates the searchQuery signal with the current value of the
   * input field, whenever the user types something in the input field.
   * @param event The input event from the input field.
   */
  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchQuery.set(inputElement.value);
  }

  /**
   * Removes a user from the selected users array.
   * @param user The user to remove from the selected users array.
   */
  removeUser(user: User) {
    this.selectedUsers.update((users) =>
      users.filter((selectedUser) => selectedUser !== user)
    );
  }

  /**
   * Adds the selected users to the active channel.
   *
   * Iterates over the selected users and adds them to the channel's member
   * list if they are not already there. Also updates the user's document in
   * the Firestore database to include the channel in their list of channels.
   * After all selected users have been added, resets the selected users array
   * and the search query.
   */
  async addUsersToChannel() {
    const channel = this.activeChannelService.activeChannel;

    for (const user of this.selectedUsers()) {
      if (!channel.member.includes(user.userID)) {
        channel.member.push(user.userID);
        await this.firestoreService.updateUserWithChannelOrDirectMessage(user.userID,'channels',channel.channelID);
        await this.firestoreService.addMemberToChannel(user.userID, channel.channelID);}}
    this.selectedUsers.set([]);
    this.searchQuery.set('');
  }
}
