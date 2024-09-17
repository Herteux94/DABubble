import { Component, OnInit, ElementRef, Renderer2, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SignUpComponent } from './sign-up/sign-up.component';
import { LoginComponent } from './login/login.component';
import { ChooseAvatarComponent } from './choose-avatar/choose-avatar.component';
import { SendResetPwMailComponent } from './send-reset-pw-mail/send-reset-pw-mail.component';
import { ResetPwComponent } from './reset-pw/reset-pw.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
/**
 * **AuthenticationComponent**
 * This component serves as the main authentication hub, managing various authentication-related sub-components
 * such as login, sign-up, avatar selection, and password reset functionalities. It includes animations for visual
 * enhancements during user interactions and handles responsiveness for different screen sizes.
 * @component
 * @selector app-authentication
 * @standalone
 * @imports LoginComponent, SignUpComponent, ChooseAvatarComponent, SendResetPwMailComponent, ResetPwComponent, RouterModule, CommonModule

 */
@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [
    LoginComponent,
    SignUpComponent,
    ChooseAvatarComponent,
    SendResetPwMailComponent,
    ResetPwComponent,
    RouterModule,
    CommonModule
  ],
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss'],
  animations: [
    trigger('logoAppear', [
      state('hidden', style({
        opacity: 0,
        visibility: 'hidden',
        transform: 'translate(-50%, -50%) scale(1.5)'
      })),
      state('hiddenMobile', style({
        opacity: 0,
        visibility: 'hidden',
        transform: 'translate(-50%, -50%) scale(1)'
      })),
      state('visible', style({
        opacity: 1,
        visibility: 'visible',
        transform: 'translate(-50%, -50%) scale(1.5)'
      })),
      state('visibleMobile', style({
        opacity: 1,
        visibility: 'visible',
        transform: 'translate(-50%, -50%) scale(1)'
      })),
      transition('hidden => visible', [
        animate('500ms ease-in-out')
      ]),
      transition('hiddenMobile => visibleMobile', [
        animate('500ms ease-in-out')
      ]),
    ]),
    trigger('slideLogo', [
      state('start', style({
        opacity: 0,
        transform: 'translateX(0) scale(1.5)'
      })),
      state('startMobile', style({
        opacity: 0,
        transform: 'translateX(0) scale(1)'
      })),
      state('end', style({
        opacity: 1,
        transform: 'translateX(-50px) scale(1.5)'
      })),
      state('reset', style({
        transform: 'translateX(0) scale(1)'
      })),
      state('mobileEnd', style({
        opacity: 1,
        transform: 'translateX(0) scale(1)'
      })),
      transition('start => end', [
        animate('500ms ease-in-out')
      ]),
      transition('end => reset', [
        animate('800ms ease-in-out')
      ]),
      transition('startMobile => mobileEnd', [
        animate('500ms ease-in-out')
      ])
    ]),
    trigger('slideText', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateX(-100px) scale(1.5)'
      })),
      state('hiddenMobile', style({
        transform: 'translateX(-100px) scale(1)',
        opacity: 0
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateX(0) scale(1.5)'
      })),
      state('visibleMobile', style({
        opacity: 1,
        transform: 'translateX(0) scale(1)'
      })),
      state('reset', style({
        transform: 'translateX(0) scale(1)',
        opacity: 1
      })),
      state('mobileEnd', style({
        transform: 'translateX(0) scale(1)',
        opacity: 1
      })),
      transition('hidden => visible', [
        animate('500ms ease-in-out')
      ]),
      transition('hiddenMobile => visibleMobile', [
        animate('500ms ease-in-out')
      ]),
      transition('visible => reset', [
        animate('800ms ease-in-out')
      ]),
      transition('hiddenMobile => mobileEnd', [
        animate('500ms ease-in-out')
      ])
    ]),
    trigger('moveToCorner', [
      state('center', style({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(1.5)',
      })),
      state('centerMobile', style({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(1)',
      })),
      state('cornerLarge', style({
        top: '20px',
        left: '60px',
        transform: 'translate(0, 0) scale(1)',
      })),
      state('cornerSmall', style({
        top: '20px',
        left: '50%',
        transform: 'translate(-50%, 0) scale(1)',
      })),
      transition('center => cornerLarge', [
        animate('800ms ease-in-out')
      ]),
      transition('centerMobile => cornerSmall', [
        animate('800ms ease-in-out')
      ]),
    ]),
    trigger('invertTextLogo', [
      state('normal', style({
        filter: 'invert(1)'
      })),
      state('inverted', style({
        filter: 'invert(0)'
      })),
      transition('normal => inverted', [
        animate('800ms ease-in-out')
      ])
    ]),
  ]
})
export class AuthenticationComponent implements OnInit {
  /**
   * Current state of the logo appearance animation.
   *
   * @type {string}
   * @default 'hidden'
   */
  logoState = 'hidden';

  /**
   * Current state of the text logo appearance animation.
   *
   * @type {string}
   * @default 'hidden'
   */
  textLogoState = 'hidden';

  /**
   * Current state of the logo slide animation.
   *
   * @type {string}
   * @default 'start'
   */
  logoSlideState = 'start';

  /**
   * Current position state of the container.
   *
   * @type {string}
   * @default 'center'
   */
  containerPosition = 'center';

  /**
   * CSS class applied to the text logo for styling purposes.
   *
   * @type {string}
   * @default 'whiteFill'
   */
  textLogoClass = 'whiteFill';

  /**
   * Current state of the overlay visibility.
   *
   * @type {string}
   * @default 'visible'
   */
  overlayState = 'visible';

  /**
   * Current state of the text logo inversion.
   *
   * @type {string}
   * @default 'normal'
   */
  textLogoInvertState = 'normal';

  /**
   * Flag indicating whether the screen size is considered small (e.g., mobile devices).
   *
   * @type {boolean}
   * @default false
   */
  isSmallScreen = false;

  /**
   * Duration of animations applied to the component.
   *
   * @type {string}
   * @default '500ms'
   */
  animationDuration = '500ms';

  /**
   * Creates an instance of AuthenticationComponent.
   *
   * @param {Renderer2} renderer - Angular Renderer2 service for manipulating DOM elements.
   * @param {ElementRef} el - Reference to the host DOM element.
   * @param {Object} platformId - Identifier for the current platform (browser or server).
   */
  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Determines if the platform is a browser and initiates platform-specific handling.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.handlePlatform();
    }
  }

  /**
   * Handles platform-specific logic, such as checking screen size,
   * managing session storage for animation states, and initiating animations.
   *
   * @returns {void}
   */
  handlePlatform(): void {
    this.checkScreenSize();
    const hasAnimated = sessionStorage.getItem('hasAnimated');
    this.animationDuration = hasAnimated ? '1ms' : this.animationDuration;
    if (!hasAnimated) {
      sessionStorage.setItem('hasAnimated', 'true');
    }
    this.startAnimation();
  }

  /**
   * Initiates the animation sequence by setting initial states and scheduling updates.
   *
   * @returns {void}
   */
  startAnimation(): void {
    this.initializeAnimationStates();
    this.scheduleAnimationUpdates();
  }

  /**
   * Initializes the animation states based on the current screen size.
   *
   * @returns {void}
   */
  private initializeAnimationStates(): void {
    this.logoState = this.isSmallScreen ? 'hiddenMobile' : 'hidden';
    this.textLogoState = this.isSmallScreen ? 'hiddenMobile' : 'hidden';
    this.logoSlideState = this.isSmallScreen ? 'startMobile' : 'start';
    this.containerPosition = this.isSmallScreen ? 'centerMobile' : 'center';
    this.textLogoClass = 'whiteFill';
    this.overlayState = 'visible';
    this.textLogoInvertState = 'normal';
  }

  /**
   * Schedules the timing of animation state updates using timeouts.
   *
   * @returns {void}
   */
  private scheduleAnimationUpdates(): void {
    setTimeout(() => this.logoState = this.isSmallScreen ? 'visibleMobile' : 'visible', this.getTimeoutDelay(1000));
    setTimeout(() => this.logoSlideState = this.isSmallScreen ? 'mobileEnd' : 'end', this.getTimeoutDelay(1500));
    setTimeout(() => this.textLogoState = this.isSmallScreen ? 'mobileEnd' : 'visible', this.getTimeoutDelay(2000));
    setTimeout(() => this.finishAnimation(), this.getTimeoutDelay(3000));
  }

  /**
   * Finalizes the animation by updating positions, resetting states, and enabling scroll if necessary.
   *
   * @returns {void}
   */
  private finishAnimation(): void {
    this.containerPosition = this.isSmallScreen ? 'cornerSmall' : 'cornerLarge';
    this.logoSlideState = 'reset';
    this.textLogoState = 'reset';
    this.textLogoInvertState = 'inverted';
    if (this.isSmallScreen) {
      this.enableScroll();
    }
    this.updateWrapperStyles();
  }

  /**
   * Calculates the timeout delay based on the current animation duration.
   * If the animation duration is set to '1ms', returns a scaled-down delay.
   *
   * @param {number} duration - The base duration in milliseconds.
   * @returns {number} - The calculated timeout delay.
   */
  private getTimeoutDelay(duration: number): number {
    return this.animationDuration === '1ms' ? duration * 0.001 : duration;
  }

  /**
   * Updates the styles of the wrapper element to ensure proper layout after animations.
   *
   * @returns {void}
   */
  private updateWrapperStyles(): void {
    const wrapperElement = this.el.nativeElement.querySelector('.wrapper');
    if (wrapperElement) {
      this.renderer.setStyle(wrapperElement, 'height', '100%');
      this.renderer.setStyle(wrapperElement, 'overflow', 'auto');
      this.renderer.addClass(this.el.nativeElement.querySelector('.overlay'), 'hiddenOverlay');
    }
  }

  /**
   * Listens for window resize events and checks the screen size to adjust component behavior accordingly.
   *
   * @param {any} event - The resize event object.
   * @returns {void}
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }

  /**
   * Checks the current screen size and updates the `isSmallScreen` flag based on the window width.
   *
   * @returns {void}
   */
  checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isSmallScreen = window.innerWidth < 1025;
    }
  }

  /**
   * Enables scrolling on the document body by setting the `overflow` style to `auto`.
   *
   * @returns {void}
   */
  enableScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.setStyle(document.body, 'overflow', 'auto');
    }
  }
}
