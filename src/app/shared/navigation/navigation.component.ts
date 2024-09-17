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

  /**
   * Constructor for the NavigationComponent.
   *
   * @param screenSizeService Injected service to check for screen size.
   * @param threadRoutingService Injected service to navigate to a thread.
   * @param firestoreService Injected service to interact with Firestore.
   * @param activeChannelService Injected service to get the active channel.
   * @param activeUserService Injected service to get the active user.
   * @param activeDirectMessageService Injected service to get the active direct message.
   * @param router Injected service to navigate to other routes.
   */
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

  /**
   * Lifecycle hook that is called after the component is initialized.
   * It checks for the screen size and stores the result in the mobile variable.
   */
  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

  /**
   * Updates the navigation search query signal with the current value of the
   * input field, whenever the user types something in the input field.
   * If the input is empty, it resets the filtered channels and users to the
   * all channels/users. If the input is not empty, it filters the channels and
   * users by their names and sets the search list open to true.
   * @param event The input event from the input field.
   */
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

  /**
   * Called when the user focuses the search input field.
   *
   * If the search query is empty, it resets the filtered channels and users
   * to all channels/users. Additionally, it sets the search list open to true,
   * so the user can see the full list of channels and users.
   */
  onInputFocus(): void {
    if (this.navigationSearchQuery().trim() === '') {
      this.filteredChannels = this.activeUserService.activeUserChannels;
      this.filteredUsers = this.firestoreService.allUsers;
    }

    this.searchListOpen = true;
  }

  /**
   * Called when the user unfocuses the search input field.
   *
   * Waits for 200ms and then sets the search list open to false, so the search
   * list is only closed after the user has had time to interact with it.
   */
  onInputBlur(): void {
    setTimeout(() => {
      this.searchListOpen = false;
    }, 200);
  }

  /**
   * Filters the channels and users by their names based on the search term.
   *
   * It filters the channels and users by their names and sorts them alphabetically
   * based on the search term. The filtered channels and users are stored in the
   * `filteredChannels` and `filteredUsers` properties respectively.
   * @param searchTerm The search term to filter the channels and users by.
   */
  filterResults(searchTerm: string) {
    this.filteredChannels = this.activeUserService.activeUserChannels
      .filter((channel) => channel.name.toLowerCase().includes(searchTerm))
      .sort((a, b) => a.name.localeCompare(b.name));

    this.filteredUsers = this.firestoreService.allUsers
      .filter((user) => user.name.toLowerCase().includes(searchTerm))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Navigates to the channel view with the given channelID.
   *
   * Loads the active channel with the given channelID and its messages by calling
   * loadActiveChannelAndMessages on the ActiveChannelService. Then, it navigates to the
   * messenger/channel/:channelID route with the given channelID.
   * @param channelID The ID of the channel to navigate to.
   */
  navigateToChannel(channelID: any) {
    this.activeChannelService.loadActiveChannelAndMessages(channelID);
    this.router.navigate([`messenger/channel/${channelID}`]);
  }

  /**
   * Opens the profile dialog for the given user.
   *
   * Opens a new dialog with the given user as the user to show in the dialog.
   * @param user The user to show in the dialog.
   */
  openProfileDialog(user: User) {
    this.dialog.open(ProfileDialogComponent, {
      data: { userID: user.userID },
    });
  }

  /**
   * Opens the CreateChannelDialogComponent to create a new channel.
   *
   * Opens a new dialog with an empty object as data, which is not used in the dialog.
   */
  openNewChannelDialog() {
    this.dialog.open(CreateChannelDialogComponent, {});
  }
}
