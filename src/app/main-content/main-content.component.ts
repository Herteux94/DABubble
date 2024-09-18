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
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

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
  // animations: [
  //   trigger('threadAnimation', [
  //     state(
  //       'open',
  //       style({
  //         opacity: 1,
  //         transform: 'scale(1) translateX(0)',
  //         visibility: 'visible',
  //       })
  //     ),
  //     state(
  //       'closed',
  //       style({
  //         opacity: 0,
  //         transform: 'scale(0.8) translateX(600px)',
  //         visibility: 'hidden',
  //       })
  //     ),
  //     transition('open <=> closed', [animate('250ms linear')]),
  //   ]),
  // ],
})
export class MainContentComponent implements OnInit {
  mobile!: boolean;
  navOpenDesktop: boolean = true;

  private readonly RESIZE_THRESHOLD = 1350;
  private readonly ADDITIONAL_THRESHOLD = 1025;
  isOverContent = false;

  /**
   * Constructor for the MainContentComponent.
   *
   * @param screenSizeService Injected service to get the current screen size.
   * @param threadRoutingService Injected service to navigate to the thread view.
   * @param route Injected service to get the active route.
   * @param renderer Injected service to render the HTML elements.
   */
  constructor(
    private screenSizeService: ScreenSizeService,
    public threadRoutingService: RoutingThreadOutletService,
    protected route: ActivatedRoute,
    private renderer: Renderer2
  ) {}

  @HostListener('window:resize', ['$event'])
  /**
   * Handles the window resize event and adds or removes the getOverContent class from the
   * .threadRouterContainer element based on the current screen width.
   *
   * @param event The event object passed from the window.resize event.
   */
  onResize(event: Event) {
    const width = (event.target as Window).innerWidth;
    const element = document.querySelector('.threadRouterContainer');
    if (element) {
      if (width < this.ADDITIONAL_THRESHOLD) {
        if (this.isOverContent) {
          this.removeGetOverContent();
        }
      } else if (width >= this.ADDITIONAL_THRESHOLD && !this.isOverContent) {
        this.addGetOverContent();
      }

      // Weiterhin die ursprüngliche Logik für die Breite von 1350px anwenden
      if (width < this.RESIZE_THRESHOLD && !this.isOverContent) {
        this.addGetOverContent();
      } else if (width >= this.RESIZE_THRESHOLD && this.isOverContent) {
        this.removeGetOverContent();
      }
    }
  }

  /**
   * Removes the getOverContent class from the .threadRouterContainer element, so it is
   * no longer positioned fixed on the right side of the screen.
   * This is called when the window is resized to a smaller width and the thread should
   * be displayed below the channel list again.
   */
  removeGetOverContent() {
    this.isOverContent = false;
    this.renderer.removeClass(
      document.querySelector('.threadRouterContainer'),
      'getOverContent'
    );
  }

  /**
   * Adds the getOverContent class to the .threadRouterContainer element, so it is
   * positioned fixed on the right side of the screen.
   * This is called when the window is resized to a larger width and the thread should
   * be displayed on the right side of the screen.
   */
  addGetOverContent() {
    this.isOverContent = true;
    this.renderer.addClass(
      document.querySelector('.threadRouterContainer'),
      'getOverContent'
    );
  }

  /**
   * Lifecycle hook that is called after the component is initialized.
   * It checks for the screen size and stores the result in the mobile variable.
   * Additionally, it calls the onResize method with the window as the target,
   * if the window is not undefined.
   */
  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });

    if (typeof window !== 'undefined') {
      this.onResize({ target: window } as unknown as Event);
    }
  }

  /**
   * Toggles the navOpenDesktop variable, which determines whether the desktop navigation is visible or not.
   * This function is called when the user clicks on the navigation toggle button.
   */
  toggleMenu() {
    this.navOpenDesktop = !this.navOpenDesktop;
  }
}
