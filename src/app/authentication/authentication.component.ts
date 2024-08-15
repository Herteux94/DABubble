import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
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
        transform: 'translate(-50%, -50%) scale(1.5)' // Start mit 1,5-facher Größe
      })),
      state('visible', style({
        opacity: 1,
        visibility: 'visible',
        transform: 'translate(-50%, -50%) scale(1.5)' // Bleibt zunächst vergrößert
      })),
      transition('hidden => visible', [
        animate('500ms ease-in-out')
      ]),
    ]),
    trigger('slideLogo', [
      state('start', style({
        opacity: 0,
        transform: 'translateX(0) scale(1.5)' // Vergrößert
      })),
      state('end', style({
        opacity: 1,
        transform: 'translateX(-60px) scale(1.5)' // Vergrößert während des Slides
      })),
      state('reset', style({
        transform: 'translateX(0) scale(1)' // Zurück auf normale Größe
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
        transform: 'translateX(-100px) scale(1.5)' // Vergrößert
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateX(0px) scale(1.5)' // Vergrößert während des Slides
      })),
      state('reset', style({
        transform: 'translateX(0) scale(1)', // Zurück auf normale Größe
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
        transform: 'translate(-50%, -50%) scale(1.5)', // Vergrößert in der Mitte
      })),
      state('corner', style({
        top: '60px',
        left: '60px',
        transform: 'translate(0, 0) scale(1)', // Normale Größe in der Ecke
      })),
      transition('center => corner', [
        animate('800ms ease-in-out')
      ]),
    ]),
    trigger('invertTextLogo', [
      state('normal', style({
        filter: 'invert(1)' // Textlogo bleibt invertiert
      })),
      state('inverted', style({
        filter: 'invert(0)' // Textlogo wird nicht invertiert
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

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngOnInit() {
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
      this.containerPosition = 'corner';
      this.logoSlideState = 'reset';
      this.textLogoState = 'reset';
      this.textLogoInvertState = 'inverted'; // Startet die Invertierung des Textlogos
      this.renderer.addClass(this.el.nativeElement.querySelector('.overlay'), 'hidden-overlay');
    }, 3000);
  }
}
