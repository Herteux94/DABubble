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

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
    this.loadUserData();
  }

  loadUserData() {
    this.members = this.findUserService.findUsers(
      this.activeChannelService.activeChannel.member
    );
  }

  openInvite() {
    this.invite = true;
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
