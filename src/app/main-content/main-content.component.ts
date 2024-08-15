import { Component, OnInit, TemplateRef } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { NavigationComponent } from '../shared/navigation/navigation.component';
import { ThreadComponent } from './thread/thread.component';
import { NavToggleBtnComponent } from '../shared/navigation/nav-toggle-btn/nav-toggle-btn.component';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Routes } from '@angular/router';
import { ThreadServiceService } from '../services/thread-service.service';
import { ScreenSizeService } from '../services/screen-size-service.service';
import { ToggleMobileComponentsService } from '../services/toggle-mobile-components.service';
import { NewMessageComponent } from './new-message/new-message.component';

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
  ],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss',
})
export class MainContentComponent implements OnInit {
  mobile!: boolean;
  navOpenDesktop: boolean = true;

  constructor(
    public threadService: ThreadServiceService,
    private screenSizeService: ScreenSizeService,
    public toggleMobileComService: ToggleMobileComponentsService
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
