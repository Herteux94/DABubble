import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { Dialog } from '@angular/cdk/dialog';
import { MenuDialogComponent } from '../../dialogs/menu-dialog/menu-dialog.component';
import { ActiveUserService } from '../../services/active-user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  dialog = inject(Dialog);
  mobile!: boolean;
  navigationCompActive: boolean = true;
  avatarUrl: string = '../../../assets/img/avatars/avatar-4.svg';

  constructor(
    private screenSizeService: ScreenSizeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public activeUserService: ActiveUserService,
  ) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });

    this.router.events.subscribe(() => {
      this.checkIfNavigationActive();
    });
  }

  openMenuDialog() {
    this.dialog.open(MenuDialogComponent, {
    });
  }

  navigateToStart() {
    if(this.mobile) {
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
    if (this.activeUserService.activeUser) {
      return this.activeUserService.activeUser.profileImg;
    } else {
      return "../../assets/img/Profile.svg"
    }
  }
}
