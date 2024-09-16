import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { User } from '../../models/user.model';
import { Channel } from '../../models/channel.model';
import { ActiveChannelService } from '../../services/active-channel.service';
import { FindUserService } from '../../services/find-user.service';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-invite-member-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './invite-member-dialog.component.html',
  styleUrl: './invite-member-dialog.component.scss',
})
export class InviteMemberDialogComponent implements OnInit {
  findUserService = inject(FindUserService);
  activeChannelService = inject(ActiveChannelService);
  dialogRef = inject(DialogRef);
  data = inject(DIALOG_DATA);
  channel!: Channel;
  members: User[] = [];
  selectedUsers = signal<User[]>([]);
  mobile: boolean = false;
  searchQuery = signal('');
  foundUsers = computed(() =>
    this.findUserService.findUsersWithName(this.searchQuery())
);


  constructor(private screenSizeService: ScreenSizeService, public firestoreService: FirestoreService) {}

  /**
   * Subscribes to the isMobile observable of the ScreenSizeService on component initialization.
   * Sets the mobile property of the component to the value received from the observable.
   */
  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
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
        await this.firestoreService.updateUserWithChannelOrDirectMessage(user.userID, 'channels', channel.channelID);
        await this.firestoreService.addMemberToChannel(user.userID, channel.channelID);
      }
    }
    this.selectedUsers.set([]);
    this.searchQuery.set('');
  }
}
