import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { ToggleMobileComponentsService } from '../../services/toggle-mobile-components.service';
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

  constructor(private screenSizeService: ScreenSizeService, public toggleMobileComService: ToggleMobileComponentsService) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

  openMenuDialog() {
    this.dialog.open(MenuDialogComponent, {  
    });
  }
}
