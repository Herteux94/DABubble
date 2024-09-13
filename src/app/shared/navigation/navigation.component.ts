import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { CreateChannelDialogComponent } from '../../dialogs/create-channel-dialog/create-channel-dialog.component';
import { Dialog } from '@angular/cdk/dialog';
import { RoutingThreadOutletService } from '../../services/routing-thread-outlet.service';
import { FirestoreService } from '../../services/firestore.service';
import { ActiveChannelService } from '../../services/active-channel.service';
import { ActiveUserService } from '../../services/active-user.service';
import { ActiveDirectMessageService } from '../../services/active-direct-message-service.service';
import { ProfileDialogComponent } from '../../dialogs/profile-dialog/profile-dialog.component';
import { User } from '../../models/user.model';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterModule,
    CreateChannelDialogComponent,
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
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
  ]
})
export class NavigationComponent implements OnInit {
  dialog = inject(Dialog);
  mobile!: boolean;
  navigationSearchQuery = signal('');
  filteredChannels: any[] = [];
  filteredUsers: any[] = [];
  searchListOpen = false;

  constructor(
    public screenSizeService: ScreenSizeService,
    public threadRoutingService: RoutingThreadOutletService,
    public firestoreService: FirestoreService,
    public activeChannelService: ActiveChannelService,
    public activeUserService: ActiveUserService,
    public activeDirectMessageService: ActiveDirectMessageService,
    private router: Router
  )
  {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

   onNavigationSearchInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.navigationSearchQuery.set(input);

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
    if (this.navigationSearchQuery().trim() === '') {
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

  openProfileDialog(user: User) {
    this.dialog.open(ProfileDialogComponent, {
      data: { userID: user.userID },
    });
  }

  openNewChannelDialog() {
    this.dialog.open(CreateChannelDialogComponent, {});
  }
}
