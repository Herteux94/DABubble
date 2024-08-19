import { animate, state, style, transition, trigger } from '@angular/animations';
import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [],
  templateUrl: './profile-dialog.component.html',
  styleUrl: './profile-dialog.component.scss',
  animations: [
    trigger('dialogAnimationFadeIn', [
      state('void', style({ opacity: 0, transform: 'scale(0.3)' })),
      state('*', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void => *', [
        animate('300ms ease-out')
      ]),
      transition('* => void', [
        animate('200ms ease-in')
      ])
    ]),
  ]
})
export class ProfileDialogComponent {
  dialogRef = inject(DialogRef);
  ownProfile: boolean = false;

  ngOnInit(): void {
    if (this.ownProfile) {
      console.log('This is the own profile view');
    }
  }
}
