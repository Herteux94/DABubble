import { CommonModule } from '@angular/common';
import { Component, computed, Inject, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { User } from '../../models/user.model';
import { Channel } from '../../models/channel.model';
import { FindUserService } from '../../services/find-user.service';
import { ActiveChannelService } from '../../services/active-channel.service';
import { FirestoreService } from '../../services/firestore.service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ActiveUserService } from '../../services/active-user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-member-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-member-dialog.component.html',
  styleUrl: './create-member-dialog.component.scss',
})
export class CreateMemberDialogComponent implements OnInit {
  user!: User;
  channel!: Channel;
  selectedMemberType: string = 'allMember';
  mobile: boolean = false;
  findUserService = inject(FindUserService);
  activeUserService = inject(ActiveUserService);
  activeChannelService = inject(ActiveChannelService);
  dialogRef = inject(DialogRef);
  members: User[] = [];
  selectedUsers = signal<User[]>([]);
  searchQuery = signal('');
  foundUsers = computed(() =>
    this.findUserService.findUsersWithName(this.searchQuery())
  );

  constructor(
    @Inject(DIALOG_DATA) public data: { channel: Channel },
    private screenSizeService: ScreenSizeService,
    public firestoreService: FirestoreService,
    private router: Router
  ) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
    this.channel = this.data.channel;
  }
  
  async submitCreateChannel() {
    try {
      const docRefID = await this.firestoreService.addChannel(
        this.channel.toJSON(),
        this.activeUserService.activeUser.userID
      );
      this.channel.channelID = docRefID;

      await this.addUsersToChannel();
      this.navigateToChannel(docRefID)
      this.dialogRef.close();

    } catch (error) {
      console.error(
        'Fehler beim Erstellen des Channels oder Hinzufügen von Benutzern:',
        error
      );
    }
  }

  navigateToChannel(channelID: string) {
    this.activeChannelService.loadActiveChannelAndMessages(channelID);
    this.router.navigate([
      `messenger/channel/${channelID}`,
    ]);
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
    const channel = this.channel;
  
    if (this.selectedMemberType === 'allMember') {
      try {
        const allUsers = await this.firestoreService.allUsers; // Annahme: Methode `getAllUsers()` existiert und gibt eine Liste aller Benutzer zurück
  
        for (const user of allUsers) {
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
      } catch (error) {
        console.error('Fehler beim Abrufen oder Hinzufügen aller Benutzer:', error);
      }
    } else {
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
  

  // async addUsersToChannel() {
  //   const channel = this.channel;

  //   for (const user of this.selectedUsers()) {
  //     if (!channel.member.includes(user.userID)) {
  //       channel.member.push(user.userID);
  //       await this.firestoreService.updateUserWithChannelOrDirectMessage(
  //         user.userID,
  //         'channels',
  //         channel.channelID
  //       );
  //       await this.firestoreService.addMemberToChannel(
  //         user.userID,
  //         channel.channelID
  //       );
  //     }
  //   }
  //   this.selectedUsers.set([]);
  //   this.searchQuery.set('');
  // }
}
