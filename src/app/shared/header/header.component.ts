import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { Dialog, DIALOG_DATA, DialogModule } from '@angular/cdk/dialog';
import { MenuDialogComponent } from '../../dialogs/menu-dialog/menu-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  dialog = inject(Dialog);
  mobile!: boolean;
  navigationCompActive: boolean = true;

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
}
