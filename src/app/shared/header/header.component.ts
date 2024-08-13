import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { ToggleMobileComponentsService } from '../../services/toggle-mobile-components.service';
import { ThreadServiceService } from '../../services/thread-service.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  mobile!: boolean;

  constructor(private screenSizeService: ScreenSizeService, public toggleMobileComService: ToggleMobileComponentsService, public threadService: ThreadServiceService) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

}
