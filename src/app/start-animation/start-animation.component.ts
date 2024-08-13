import { Component } from '@angular/core';
import { trigger, state, style, animate, transition, sequence } from '@angular/animations';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-animation',
  standalone: true,
  templateUrl: './start-animation.component.html',
  styleUrls: ['./start-animation.component.scss'],
  animations: [
    trigger('moveLogo', [
      state('center', style({ transform: 'translateX(-50%)' })),
      state('left', style({ transform: 'translateX(-110%)' })),
      transition('center => left', [
        animate('1.5s ease-in-out')
      ])
    ]),
    trigger('revealText', [
      state('hidden', style({ opacity: 0, transform: 'translateX(-70px)' })),
      state('visible', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('hidden => visible', [
        animate('1s ease-out')
      ])
    ]),
    trigger('moveToCorner', [
      state('center', style({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })),
      state('corner', style({ top: '60px', left: '60px', transform: 'translate(0, 0)' })),
      transition('center => corner', [
        animate('1s ease-in-out')
      ])
    ]),
    trigger('fadeOutBackground', [
      state('opaque', style({ opacity: 1 })),
      state('transparent', style({ opacity: 0 })),
      transition('opaque => transparent', [
        animate('1s ease-in-out')
      ])
    ])
  ]
})
export class StartAnimationComponent {
  logoState = 'center';
  textState = 'hidden';
  cornerState = 'center';
  backgroundState = 'opaque';

  constructor(private router: Router) { }

  ngOnInit() {
    setTimeout(() => {
      this.logoState = 'left';
    }, 500);

    setTimeout(() => {
      this.textState = 'visible';
    }, 2000);

    setTimeout(() => {
      this.cornerState = 'corner';
    }, 4000);

    setTimeout(() => {
      this.backgroundState = 'transparent';
    }, 5000);
  }

  onAnimationDone() {
    this.router.navigate(['/authentication/login']);
  }
}
