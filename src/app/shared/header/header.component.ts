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

  /**
   * Constructor for the HeaderComponent.
   *
   * @param screenSizeService Injected service to check for screen size.
   * @param router Injected service to navigate to other routes.
   */
  constructor(
    private screenSizeService: ScreenSizeService,
    private router: Router
  ) {}

  /**
   * Lifecycle hook that is called after the component is initialized.
   * It checks for the screen size and stores the result in the mobile variable.
   * Additionally, it calls the checkIfNavigationActive method with the router events as the target,
   * if the target is not undefined.
   */
  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });

    this.router.events.subscribe(() => {
      this.checkIfNavigationActive();
    });
  }

  /**
   * Updates the header search query signal with the current value of the
   * input field, whenever the user types something in the input field.
   * If the input is empty, it resets the filtered channels and users to the
   * all channels/users. If the input is not empty, it filters the channels and
   * users by their names and sets the search list open to true.
   * @param event The input event from the input field.
   */
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

  /**
   * Called when the user focuses the search input field.
   *
   * If the search query is empty, it resets the filtered channels and users
   * to all channels/users. Additionally, it sets the search list open to true,
   * so the user can see the full list of channels and users.
   */
  onInputFocus(): void {
    if (this.headerSearchQuery().trim() === '') {
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
   * Opens the menu dialog.
   *
   * Opens the menu dialog by calling open on the dialog service with the
   * MenuDialogComponent.
   */
  openMenuDialog() {
    this.dialog.open(MenuDialogComponent, {});
  }

  /**
   * Opens the profile dialog for the given user.
   *
   * Opens a new dialog with the given user as the user to show in the dialog.
   * Additionally, it sets the dialogOpen flag to true and resets the header search query.
   * @param user The user to show in the dialog.
   */
  openProfileDialog(user: User) {
    this.dialog.open(ProfileDialogComponent, {
      data: { userID: user.userID },
    });
    this.dialogOpen = true;
    this.headerSearchQuery.set('');
  }

  /**
   * Navigates to the start view depending on the screen size.
   *
   * If the screen size is mobile, it navigates to the navigation view.
   * Otherwise, it navigates to the hello view.
   */
  navigateToStart() {
    if (this.mobile) {
      this.router.navigate(['/messenger/navigation']);
    } else {
      this.router.navigate(['/messenger/hello']);
    }
  }

  /**
   * Checks if the current route is the navigation view.
   *
   * Sets the navigationCompActive flag to true if the current route is the
   * navigation view, and false otherwise.
   */
  checkIfNavigationActive() {
    const currentUrl = this.router.url;
    if (currentUrl.endsWith('/navigation')) {
      this.navigationCompActive = true;
    } else {
      this.navigationCompActive = false;
    }
  }

  /**
   * Returns the profile image of the active user if it exists, otherwise returns the default profile image.
   *
   * @returns The profile image of the active user or the default profile image.
   */
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
