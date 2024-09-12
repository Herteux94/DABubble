import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { NavigationComponent } from '../shared/navigation/navigation.component';
import { NavToggleBtnComponent } from '../shared/navigation/nav-toggle-btn/nav-toggle-btn.component';
import { CommonModule } from '@angular/common';
import {
  RouterModule,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
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

  private readonly RESIZE_THRESHOLD = 1350;
  private readonly ADDITIONAL_THRESHOLD = 1025;
  isOverContent = false;

  constructor(
    private screenSizeService: ScreenSizeService,
    public threadRoutingService: RoutingThreadOutletService,
    protected route: ActivatedRoute,
    private renderer: Renderer2
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const width = (event.target as Window).innerWidth;
    const element = document.querySelector('.threadRouterContainer');
    if (element) {
      if (width < this.ADDITIONAL_THRESHOLD) {
        // Entferne die Klasse getOverContent, wenn die Breite unter 1025px liegt
        if (this.isOverContent) {
          this.isOverContent = false;
          this.renderer.removeClass(
            document.querySelector('.threadRouterContainer'),
            'getOverContent'
          );
        }
      } else if (width >= this.ADDITIONAL_THRESHOLD && !this.isOverContent) {
        // Füge die Klasse getOverContent hinzu, wenn die Breite 1025px oder mehr beträgt
        this.isOverContent = true;
        this.renderer.addClass(
          document.querySelector('.threadRouterContainer'),
          'getOverContent'
        );
      }

      // Weiterhin die ursprüngliche Logik für die Breite von 1350px anwenden
      if (width < this.RESIZE_THRESHOLD && !this.isOverContent) {
        this.isOverContent = true;
        this.renderer.addClass(
          document.querySelector('.threadRouterContainer'),
          'getOverContent'
        );
      } else if (width >= this.RESIZE_THRESHOLD && this.isOverContent) {
        this.isOverContent = false;
        this.renderer.removeClass(
          document.querySelector('.threadRouterContainer'),
          'getOverContent'
        );
      }
    }
  }

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });

    if (typeof window !== 'undefined') {
      this.onResize({ target: window } as unknown as Event);
    }
  }

  toggleMenu() {
    this.navOpenDesktop = !this.navOpenDesktop;
  }
}
