import { Component, inject, OnInit, signal } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { Dialog } from '@angular/cdk/dialog';
import { MenuDialogComponent } from '../../dialogs/menu-dialog/menu-dialog.component';
import { ActiveUserService } from '../../services/active-user.service';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { FirestoreService } from '../../services/firestore.service';
import { ProfileDialogComponent } from '../../dialogs/profile-dialog/profile-dialog.component';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ActiveChannelService } from '../../services/active-channel.service';
// import { ActualTimestampService } from '../../services/actual-timestamp.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  animations: [
    trigger('openSearchList', [
      state('void', style({ opacity: 0, transform: 'scaleY(0)' })),
      state('*', style({ opacity: 1, transform: 'scaleY(1)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'scaleY(0)' }),
        animate('300ms ease-out'),
      ]),
      transition('* => void', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'scaleY(0)' })),
      ]),
    ]),
  ],
})
export class HeaderComponent implements OnInit {
  dialog = inject(Dialog);
  activeUserService = inject(ActiveUserService);
  firestoreService = inject(FirestoreService);
  activeChannelService = inject(ActiveChannelService);
  mobile!: boolean;
  navigationCompActive: boolean = true;
  avatarUrl: string = '../../../assets/img/avatars/avatar-4.svg';
  user!: User[];
  dialogOpen = false;
  headerSearchQuery = signal('');
  filteredChannels: any[] = [];
  filteredUsers: any[] = [];
  searchListOpen = false;

  constructor(
    private screenSizeService: ScreenSizeService,
    private router: Router
  ) // public actualTimestampService: ActualTimestampService
  {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });

    this.router.events.subscribe(() => {
      this.checkIfNavigationActive();
    });
  }

  onHeaderSearchInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.headerSearchQuery.set(input);

    if (input.trim() === '') {
      this.filteredChannels = this.activeUserService.activeUserChannels;
      this.filteredUsers = this.firestoreService.allUsers;
    } else {
      this.filteredChannels = this.activeUserService.activeUserChannels.filter(
        (channel) => channel.name.toLowerCase().includes(input.toLowerCase())
      );

      this.filteredUsers = this.firestoreService.allUsers.filter((user) =>
        user.name.toLowerCase().includes(input.toLowerCase())
      );
    }

    this.searchListOpen = true;
  }

  onInputFocus(): void {
    if (this.headerSearchQuery().trim() === '') {
      this.filteredChannels = this.activeUserService.activeUserChannels;
      this.filteredUsers = this.firestoreService.allUsers;
    }

    this.searchListOpen = true;
  }

  onInputBlur(): void {
    setTimeout(() => {
      this.searchListOpen = false;
    }, 200);
  }

  filterResults(searchTerm: string) {
    this.filteredChannels = this.activeUserService.activeUserChannels
      .filter((channel) => channel.name.toLowerCase().includes(searchTerm))
      .sort((a, b) => a.name.localeCompare(b.name));

    this.filteredUsers = this.firestoreService.allUsers
      .filter((user) => user.name.toLowerCase().includes(searchTerm))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  navigateToChannel(channelID: any) {
    this.activeChannelService.loadActiveChannelAndMessages(channelID);
    this.router.navigate([`messenger/channel/${channelID}`]);
  }

  openMenuDialog() {
    this.dialog.open(MenuDialogComponent, {});
  }

  openProfileDialog(user: User) {
    this.dialog.open(ProfileDialogComponent, {
      data: { userID: user.userID },
    });
    this.dialogOpen = true;
    this.headerSearchQuery.set('');
  }

  navigateToStart() {
    if (this.mobile) {
      this.router.navigate(['/messenger/navigation']);
    } else {
      this.router.navigate(['/messenger/hello']);
    }
  }

  checkIfNavigationActive() {
    const currentUrl = this.router.url;
    if (currentUrl.endsWith('/navigation')) {
      this.navigationCompActive = true;
    } else {
      this.navigationCompActive = false;
    }
  }

  getProfileImage() {
    if (
      this.activeUserService.activeUser &&
      this.activeUserService.activeUser.profileImg != ''
    ) {
      return this.activeUserService.activeUser.profileImg;
    } else {
      return '../../assets/img/Profile.svg';
    }
  }
}
