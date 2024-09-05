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

export interface DialogData {
  animal: 'panda' | 'unicorn' | 'lion'; // Natürlich noch brauchbare daten anlegen
}

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

  constructor(
    public screenSizeService: ScreenSizeService,
    public threadRoutingService: RoutingThreadOutletService,
    public activeDirectMessageService: ActiveDirectMessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

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

  // selectUser(user: User): void {
  //   const existingDM = this.activeUserService.activeUserDirectMessages.find(
  //     (dm) => dm.member.includes(user.userID)
  //   );

  //   if (existingDM) {
  //     this.router.navigate([
  //       `messenger/directMessage/${existingDM.directMessageID}`,
  //     ]);
  //   } else {
  //     // Benutzername im Eingabefeld anzeigen für neue Direct Message
  //     this.searchQuery.set(`@${user.name}`);
  //     this.newDirectMessageService.messageReceiver = user;
  //   }
  // }

  selectChannel(channel: Channel) {
    this.activeChannelService.loadActiveChannelAndMessages(channel.channelID);
    this.router.navigate([`messenger/channel/${channel.channelID}`]);
  }

  findUserChannelWithName(name: string) {
    return this.activeUserService.activeUserChannels.filter((channel) =>
      channel.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  openMemberDialog() {
    this.dialog.open(ChannelMemberDialogComponent, {
      // minWidth: '300px',
      // data: {
      //   animal: 'panda',
      //  panelClass: 'custom-dialog-container'
      // },
    });
  }

  openInviteDialog() {
    this.dialog.open(InviteMemberDialogComponent, {});
  }

  openProfileDialog() {
    this.dialog.open(ProfileDialogComponent, {
      data: { userID: this.activeDirectMessageService.activeDMPartner.userID },
    });
  }

  openChannelDialog() {
    this.dialog.open(ChannelDialogComponent, {});
  }

  closeThread() {
    if (this.mobile) {
      history.back();
    } else {
      this.threadRoutingService.closeThread();
    }
  }
}
