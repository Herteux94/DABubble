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

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

  selectUser(user: User) {
    if (!this.selectedUsers().includes(user)) {
      this.selectedUsers.update((users) => [...users, user]);
    }
    this.searchQuery.set('');
    this.showSelectedUsers();
  }

  showSelectedUsers() {
    const users = this.selectedUsers();
    return users;
  }

  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchQuery.set(inputElement.value);
  }

  removeUser(user: User) {
    this.selectedUsers.update((users) =>
      users.filter((selectedUser) => selectedUser !== user)
    );
  }

  async addUsersToChannel() {
    const channel = this.activeChannelService.activeChannel;

    for (const user of this.selectedUsers()) {
      if (!channel.member.includes(user.userID)) {
        channel.member.push(user.userID);
        await this.firestoreService.updateUserWithChannelOrDirectMessage(
          user.userID,
          'channels',
          channel.channelID
        );
        await this.firestoreService.addMemberToChannel(
          user.userID,
          channel.channelID
        );
      }
    }
    this.selectedUsers.set([]);
    this.searchQuery.set('');
  }

}
