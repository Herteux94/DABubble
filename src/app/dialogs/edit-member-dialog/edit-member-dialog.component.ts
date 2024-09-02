import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { DialogRef } from '@angular/cdk/dialog';
import { User } from '../../models/user.model';
import { Channel } from '../../models/channel.model';
import { FirestoreService } from '../../services/firestore.service';
import { ActiveChannelService } from '../../services/active-channel.service';
import { FindUserService } from '../../services/find-user.service';

@Component({
  selector: 'app-edit-member-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-member-dialog.component.html',
  styleUrl: './edit-member-dialog.component.scss',
})
export class EditMemberDialogComponent implements OnInit {
  dialogRef = inject(DialogRef);
  channel!: Channel;
  mobile: boolean = false;
  findUserService = inject(FindUserService);
  activeChannelService = inject(ActiveChannelService);
  members: User[] = [];
  selectedUsers = signal<User[]>([]);
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
