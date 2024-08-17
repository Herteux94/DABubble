import {
  Component,
  OnInit
} from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { NavigationComponent } from '../shared/navigation/navigation.component';
import { NavToggleBtnComponent } from '../shared/navigation/nav-toggle-btn/nav-toggle-btn.component';
import { CommonModule } from '@angular/common';
import {
  RouterModule,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router,
  NavigationEnd,
  ActivatedRoute,
} from '@angular/router';
import { ScreenSizeService } from '../services/screen-size-service.service';
import { NewMessageComponent } from './new-message/new-message.component';
import { ThreadComponent } from './thread/thread.component';
import { RoutingThreadOutletService } from '../services/routing-thread-outlet.service';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [
    HeaderComponent,
    NavigationComponent,
    ThreadComponent,
    NavToggleBtnComponent,
    CommonModule,
    RouterModule,
    RouterOutlet,
    CommonModule,
    NewMessageComponent,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss',
})

export class MainContentComponent implements OnInit {
  mobile!: boolean;
  navOpenDesktop: boolean = true;

  constructor(
    private screenSizeService: ScreenSizeService,
    public threadRoutingService: RoutingThreadOutletService
  ) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

  toggleMenu() {
    this.navOpenDesktop = !this.navOpenDesktop;
  }
}
