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

  /**
   * Constructor for the CreateMemberDialogComponent.
   *
   * @param data The channel for which the members should be created. It is injected
   * through the DIALOG_DATA injection token.
   * @param screenSizeService Injected service to check for screen size.
   * @param firestoreService Injected service to interact with Firestore.
   * @param router Injected service to navigate to other routes.
   */
  constructor(
    @Inject(DIALOG_DATA) public data: { channel: Channel },
    private screenSizeService: ScreenSizeService,
    public firestoreService: FirestoreService,
    private router: Router
  ) {}

  /**
   * Lifecycle hook that is called after the component is initialized.
   * It checks for the screen size and stores the result in the mobile variable.
   * It also loads the channel data from the dialog data.
   */
  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
    this.channel = this.data.channel;
  }
  
  /**
   * Submits the create member dialog form if it is valid.
   *
   * Creates a new channel with the given name, description, and the user as the creator and the first member.
   * It then closes the dialog and opens the create member dialog with the newly created channel.
   *
   * @remarks
   * If the form is not valid, it will log a message to the console and not send the form.
   */
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

  /**
   * Navigates to the channel view with the given channelID.
   *
   * Loads the active channel with the given channelID and its messages by calling
   * loadActiveChannelAndMessages on the ActiveChannelService. Then, it navigates to the
   * messenger/channel/:channelID route with the given channelID.
   * @param channelID The ID of the channel to navigate to.
   */
  navigateToChannel(channelID: string) {
    this.activeChannelService.loadActiveChannelAndMessages(channelID);
    this.router.navigate([
      `messenger/channel/${channelID}`,
    ]);
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
}
