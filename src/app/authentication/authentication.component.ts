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
    // Gemeinsame Animationen für große und kleine Bildschirme
    trigger('logoAppear', [
      state('hidden', style({
        opacity: 0,
        visibility: 'hidden',
        transform: 'translate(-50%, -50%) scale(1)'
      })),
      state('visible', style({
        opacity: 1,
        visibility: 'visible',
        transform: 'translate(-50%, -50%) scale(1)'
      })),
      transition('hidden => visible', [
        animate('500ms ease-in-out')
      ]),
    ]),
    trigger('slideLogo', [
      state('start', style({
        opacity: 0,
        transform: 'translateX(0) scale(1)'
      })),
      state('end', style({
        opacity: 1,
        transform: 'translateX(0) scale(1)'
      })),
      state('reset', style({
        transform: 'translateX(0) scale(1)'
      })),
      transition('start => end', [
        animate('500ms ease-in-out')
      ]),
      transition('end => reset', [
        animate('800ms ease-in-out')
      ])
    ]),
    trigger('slideText', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateX(-100px) scale(1)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateX(0px) scale(1)'
      })),
      state('reset', style({
        transform: 'translateX(0) scale(1)',
        opacity: 1
      })),
      transition('hidden => visible', [
        animate('500ms ease-in-out')
      ]),
      transition('visible => reset', [
        animate('800ms ease-in-out', style({
          transform: 'translateX(0) scale(1)',
          opacity: 1
        }))
      ])
    ]),
    trigger('moveToCorner', [
      state('center', style({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(1)',
      })),
      state('cornerLarge', style({
        top: '60px',
        left: '60px',
        transform: 'translate(0, 0) scale(1)',
      })),
      state('cornerSmall', style({
        top: '60px',
        left: '50%',
        transform: 'translate(-50%, 0) scale(1)',
      })),
      transition('center => cornerLarge', [
        animate('800ms ease-in-out')
      ]),
      transition('center => cornerSmall', [
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
  textLogoClass = 'whiteFill'; // Start mit weißer Schrift
  overlayState = 'visible'; // Startet mit sichtbarem Overlay
  textLogoInvertState = 'normal'; // Initialzustand des Textlogos
  isSmallScreen = false;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object // PLATFORM_ID wird injiziert
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();

      setTimeout(() => {
        this.logoState = 'visible';
      }, 1000);

      setTimeout(() => {
        this.logoSlideState = 'end';
      }, 1500);

      setTimeout(() => {
        this.textLogoState = 'visible';
      }, 2000);

      setTimeout(() => {
        this.containerPosition = this.isSmallScreen ? 'cornerSmall' : 'cornerLarge';
        this.logoSlideState = 'reset';
        this.textLogoState = 'reset';
        this.textLogoInvertState = 'inverted';

        if (this.isSmallScreen) {
          this.enableScroll();
        }
      }, 3000);

      setTimeout(() => {
        const wrapperElement = this.el.nativeElement.querySelector('.wrapper');
        if (wrapperElement) {
          this.renderer.setStyle(wrapperElement, 'height', '100%');
          this.renderer.setStyle(wrapperElement, 'overflow', 'auto');
          this.renderer.addClass(this.el.nativeElement.querySelector('.overlay'), 'hiddenOverlay');
        }
      }, 3700)
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
