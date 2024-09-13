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
      this.checkScreenSize();
      const hasAnimated = sessionStorage.getItem('hasAnimated');
      if (hasAnimated) {
        this.animationDuration = '1ms';
      } else {
        sessionStorage.setItem('hasAnimated', 'true');
      }
      this.startAnimation();
    }
  }

  startAnimation() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.isSmallScreen) {
        this.logoState = 'hiddenMobile';
        this.textLogoState = 'hiddenMobile';
        this.logoSlideState = 'startMobile';
        this.containerPosition = 'centerMobile';
        this.textLogoClass = 'whiteFill';
        this.overlayState = 'visible';
        this.textLogoInvertState = 'normal';
      } else {
        this.logoState = 'hidden';
        this.textLogoState = 'hidden';
        this.logoSlideState = 'start';
        this.containerPosition = 'center';
        this.textLogoClass = 'whiteFill';
        this.overlayState = 'visible';
        this.textLogoInvertState = 'normal';
      }

      setTimeout(() => {
        this.logoState = this.isSmallScreen ? 'visibleMobile' : 'visible';
      }, this.animationDuration === '1ms' ? 0.1 : 1000);

      setTimeout(() => {
        this.logoSlideState = this.isSmallScreen ? 'mobileEnd' : 'end';
      }, this.animationDuration === '1ms' ? 0.2 : 1500);

      setTimeout(() => {
        this.textLogoState = this.isSmallScreen ? 'mobileEnd' : 'visible';
      }, this.animationDuration === '1ms' ? 0.3 : 2000);

      setTimeout(() => {
        this.containerPosition = this.isSmallScreen ? 'cornerSmall' : 'cornerLarge';
        this.logoSlideState = 'reset';
        this.textLogoState = 'reset';
        this.textLogoInvertState = 'inverted';
        if (this.isSmallScreen) {
          this.enableScroll();
        }
      }, this.animationDuration === '1ms' ? 0.4 : 3000);

      setTimeout(() => {
        const wrapperElement = this.el.nativeElement.querySelector('.wrapper');
        if (wrapperElement) {
          this.renderer.setStyle(wrapperElement, 'height', '100%');
          this.renderer.setStyle(wrapperElement, 'overflow', 'auto');
          this.renderer.addClass(this.el.nativeElement.querySelector('.overlay'), 'hiddenOverlay');
        }
      }, this.animationDuration === '1ms' ? 0.5 : 3700);
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
