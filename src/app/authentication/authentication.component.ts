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
  logoState = 'hidden';
  textLogoState = 'hidden';
  logoSlideState = 'start';
  containerPosition = 'center';
  textLogoClass = 'whiteFill';
  overlayState = 'visible';
  textLogoInvertState = 'normal';
  isSmallScreen = false;
  animationDuration = '500ms';

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.handlePlatform();
    }
  }

  handlePlatform() {
    this.checkScreenSize();
    const hasAnimated = sessionStorage.getItem('hasAnimated');
    this.animationDuration = hasAnimated ? '1ms' : this.animationDuration;
    if (!hasAnimated) {
      sessionStorage.setItem('hasAnimated', 'true');
    }
    this.startAnimation();
  }

  startAnimation() {
    this.initializeAnimationStates();
    this.scheduleAnimationUpdates();
  }

  private initializeAnimationStates() {
    this.logoState = this.isSmallScreen ? 'hiddenMobile' : 'hidden';
    this.textLogoState = this.isSmallScreen ? 'hiddenMobile' : 'hidden';
    this.logoSlideState = this.isSmallScreen ? 'startMobile' : 'start';
    this.containerPosition = this.isSmallScreen ? 'centerMobile' : 'center';
    this.textLogoClass = 'whiteFill';
    this.overlayState = 'visible';
    this.textLogoInvertState = 'normal';
  }

  private scheduleAnimationUpdates() {
    setTimeout(() => this.logoState = this.isSmallScreen ? 'visibleMobile' : 'visible', this.getTimeoutDelay(1000));
    setTimeout(() => this.logoSlideState = this.isSmallScreen ? 'mobileEnd' : 'end', this.getTimeoutDelay(1500));
    setTimeout(() => this.textLogoState = this.isSmallScreen ? 'mobileEnd' : 'visible', this.getTimeoutDelay(2000));
    setTimeout(() => this.finishAnimation(), this.getTimeoutDelay(3000));
  }

  private finishAnimation() {
    this.containerPosition = this.isSmallScreen ? 'cornerSmall' : 'cornerLarge';
    this.logoSlideState = 'reset';
    this.textLogoState = 'reset';
    this.textLogoInvertState = 'inverted';
    if (this.isSmallScreen) {
      this.enableScroll();
    }
    this.updateWrapperStyles();
  }

  private getTimeoutDelay(duration: number) {
    return this.animationDuration === '1ms' ? duration * 0.001 : duration;
  }

  private updateWrapperStyles() {
    const wrapperElement = this.el.nativeElement.querySelector('.wrapper');
    if (wrapperElement) {
      this.renderer.setStyle(wrapperElement, 'height', '100%');
      this.renderer.setStyle(wrapperElement, 'overflow', 'auto');
      this.renderer.addClass(this.el.nativeElement.querySelector('.overlay'), 'hiddenOverlay');
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }

  checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      this.isSmallScreen = window.innerWidth < 1025;
    }
  }

  enableScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.setStyle(document.body, 'overflow', 'auto');
    }
  }
}
