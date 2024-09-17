import {
  Component,
  computed,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { ScreenSizeService } from '../../../services/screen-size-service.service';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { InviteMemberDialogComponent } from '../../../dialogs/invite-member-dialog/invite-member-dialog.component';
import { ChannelMemberDialogComponent } from '../../../dialogs/channel-member-dialog/channel-member-dialog.component';
import { ProfileDialogComponent } from '../../../dialogs/profile-dialog/profile-dialog.component';
import { ChannelDialogComponent } from '../../../dialogs/channel-dialog/channel-dialog.component';
import { RoutingThreadOutletService } from '../../../services/routing-thread-outlet.service';
import { ActiveChannelService } from '../../../services/active-channel.service';
import { ActiveDirectMessageService } from '../../../services/active-direct-message-service.service';
import { FindUserService } from '../../../services/find-user.service';
import { User } from '../../../models/user.model';
import { CommonModule } from '@angular/common';
import { Channel } from '../../../models/channel.model';
import { ActiveUserService } from '../../../services/active-user.service';
import { Router } from '@angular/router';
import { NewDirectMessageService } from '../../../services/new-direct-message.service';

@Component({
  selector: 'app-sub-header',
  standalone: true,
  imports: [CommonModule, DialogModule],
  templateUrl: './sub-header.component.html',
  styleUrl: './sub-header.component.scss',
})
export class SubHeaderComponent implements OnInit {
  dialog = inject(Dialog);
  findUserService = inject(FindUserService);
  activeChannelService = inject(ActiveChannelService);
  activeUserService = inject(ActiveUserService);
  newDirectMessageService = inject(NewDirectMessageService);

  @Input() isChannel!: boolean;
  @Input() isThread!: boolean;
  @Input() isDM!: boolean;
  @Input() isNewMsg!: boolean;

  mobile!: boolean;
  searchQuery = signal('');
  firstLetter = signal('');

  foundUsers = computed(() => {
    if (this.firstLetter() === '@') {
      return this.findUserService.findUsersWithName(
        this.searchQuery().substring(1)
      );
    }
    return [];
  });

  foundChannel = computed(() => {
    if (this.firstLetter() === '#') {
      return this.findUserChannelWithName(this.searchQuery().substring(1));
    }
    return [];
  });

  foundUsersWithMail = computed(() => {
    if (this.firstLetter() === '') {
      return this.findUserService.findUsersWithEmail(this.searchQuery());
    }
    return [];
  });

  /**
   * Constructor for the SubHeaderComponent.
   *
   * @param screenSizeService Injected service to check for screen size.
   * @param threadRoutingService Injected service to navigate to a thread.
   * @param activeDirectMessageService Injected service to get the active direct message.
   * @param router Injected service to navigate to other routes.
   */
  constructor(
    public screenSizeService: ScreenSizeService,
    public threadRoutingService: RoutingThreadOutletService,
    public activeDirectMessageService: ActiveDirectMessageService,
    private router: Router
  ) {}

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   * Subscribes to the isMobile observable of the ScreenSizeService and sets the mobile property of the component
   * to the value received from the observable.
   */
  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

  /**
   * Updates the searchQuery signal with the current value of the
   * input field, whenever the user types something in the input field.
   * If the input is empty, it resets the firstLetter signal to an empty string.
   * If the input starts with '@', it sets the firstLetter signal to '@'.
   * If the input starts with '#', it sets the firstLetter signal to '#'.
   * @param event The input event from the input field.
   */
  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;

    this.searchQuery.set(inputValue);

    if (inputValue.startsWith('@')) {
      this.firstLetter.set('@');
    } else if (inputValue.startsWith('#')) {
      this.firstLetter.set('#');
    } else {
      this.firstLetter.set('');
    }
  }

  /**
   * Selects a user to start a direct message with.
   * If a direct message with the user already exists, it navigates to the direct message.
   * If it doesn't, it sets the message receiver of the NewDirectMessageService to the user,
   * and sets the search query to the user's name preceded by '@'.
   * @param user The user to select.
   */
  selectUser(user: User): void {
    const directMessages =
      this.activeUserService.activeUserDirectMessages || [];

    const existingDM = directMessages.find((dm) =>
      dm.member.includes(user.userID)
    );

    if (existingDM) {
      this.router.navigate([
        `messenger/directMessage/${existingDM.directMessageID}`,
      ]);
    } else {
      this.searchQuery.set(`@${user.name}`);
      this.newDirectMessageService.messageReceiver = user;
    }
  }

  /**
   * Selects a channel to navigate to.
   * Loads the active channel with the given channelID and its messages by calling
   * loadActiveChannelAndMessages on the ActiveChannelService. Then, it navigates to the
   * messenger/channel/:channelID route with the given channelID.
   * @param channel The channel to select.
   */
  selectChannel(channel: Channel) {
    this.activeChannelService.loadActiveChannelAndMessages(channel.channelID);
    this.router.navigate([`messenger/channel/${channel.channelID}`]);
  }

  /**
   * Finds all channels in the active user's channels array with a name that includes the given name (case insensitive).
   * @param name The name to search for.
   * @returns An array of channels with the given name.
   */
  findUserChannelWithName(name: string) {
    return this.activeUserService.activeUserChannels.filter((channel) =>
      channel.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  /**
   * Opens the ChannelMemberDialogComponent to view the members of the active channel.
   *
   * The dialog is opened with an empty object as data, which is not used in the dialog.
   */
  openMemberDialog() {
    this.dialog.open(ChannelMemberDialogComponent, {});
  }

  /**
   * Opens the InviteMemberDialogComponent to invite members to the active channel.
   *
   * The dialog is opened with an empty object as data, which is not used in the dialog.
   */
  openInviteDialog() {
    this.dialog.open(InviteMemberDialogComponent, {});
  }

  /**
   * Opens the ProfileDialogComponent to view the profile of the active direct message partner.
   *
   * If the active direct message has a partner, it opens the dialog with the partner's user ID as data.
   * If the active direct message does not have a partner, it opens the dialog with the active user's user ID as data.
   */
  openProfileDialog() {
    if (this.activeDirectMessageService.activeDMPartner?.userID) {
      this.dialog.open(ProfileDialogComponent, {
        data: {
          userID: this.activeDirectMessageService.activeDMPartner.userID,
        },
      });
    } else {
      this.dialog.open(ProfileDialogComponent, {
        data: { userID: this.activeUserService.activeUser.userID },
      });
    }
  }

  /**
   * Opens the ChannelDialogComponent to edit the channel settings of the active channel.
   *
   * The dialog is opened with an empty object as data, which is not used in the dialog.
   */
  openChannelDialog() {
    this.dialog.open(ChannelDialogComponent, {});
  }

  /**
   * Closes the thread view.
   *
   * If the client is a mobile device, it goes back in the history.
   * If the client is not a mobile device, it calls the closeThread method of the
   * RoutingThreadOutletService to close the thread view.
   */
  closeThread() {
    if (this.mobile) {
      history.back();
    } else {
      this.threadRoutingService.closeThread();
    }
  }
}
