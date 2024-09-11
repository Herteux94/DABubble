import { Component, inject, OnInit, signal } from '@angular/core';
import {
  ActivatedRoute,
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

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  dialog = inject(Dialog);
  activeUserService = inject(ActiveUserService);
  firestoreService = inject(FirestoreService);
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
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });

    this.router.events.subscribe(() => {
      this.checkIfNavigationActive();
    });
  }

  onHeaderSearchInput(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.headerSearchQuery.set(searchTerm);
    this.filterResults(searchTerm);
  }

  onInputFocus() {
    this.searchListOpen = true;
  }

  onInputBlur() {
    setTimeout(() => {
      this.searchListOpen = false;
      this.headerSearchQuery.set("");
    }, 200); // Verzögerung, um sicherzustellen, dass der Klick auf das Ergebnis registriert wird
  }

  filterResults(searchTerm: string) {
    this.filteredChannels = this.activeUserService.activeUserChannels
      .filter(channel => channel.name.toLowerCase().includes(searchTerm))
      .sort((a, b) => a.name.localeCompare(b.name));

    this.filteredUsers = this.firestoreService.allUsers
      .filter(user => user.name.toLowerCase().includes(searchTerm))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  navigateToChannel(channelID: any) {
    this.router.navigate([`messenger/channel/${channelID}`]);
  }

  // onHeaderSearchInput(event: Event): void {
  //   const inputElement = event.target as HTMLInputElement;
  //   const inputValue = inputElement.value;
  //   this.dialogOpen = false;
  //   this.headerSearchQuery.set(inputValue);

  //   if (inputValue.startsWith('@')) {
  //     this.firstLetter.set('@');
  //   } else if (inputValue.startsWith('#')) {
  //     this.firstLetter.set('#');
  //   } else {
  //     this.firstLetter.set('');
  //   }
  // }

  openMenuDialog() {
    this.dialog.open(MenuDialogComponent, {});
  }

  openProfileDialog(user:User) {
    this.dialog.open(ProfileDialogComponent, {
      data: { userID: user.userID },
    });
    this.dialogOpen = true;
    this.headerSearchQuery.set("");
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
