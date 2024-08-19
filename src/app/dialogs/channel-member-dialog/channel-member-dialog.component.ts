import { Component, OnInit, Inject, inject } from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { CommonModule } from '@angular/common';
import { InviteMemberDialogComponent } from '../invite-member-dialog/invite-member-dialog.component';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-channel-member-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './channel-member-dialog.component.html',
  styleUrl: './channel-member-dialog.component.scss',
  animations: [
    trigger('dialogAnimationSlideInRight', [
      state('void', style({ transform: 'translateX(100%)', opacity: 0 })),
      state('*', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('void => *', [
        animate('300ms ease-in')
      ]),
      transition('* => void', [
        animate('300ms ease-out', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ]),
  ]
})
export class ChannelMemberDialogComponent implements OnInit {
  dialogRef = inject(DialogRef);
  invite : boolean = false;
  mobile: boolean = false;
  contactData = {
    name: '',
  };
  constructor(private screenSizeService: ScreenSizeService) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }
  onSubmit(ngForm: NgForm) {}
  openInvite() {
    this.invite = true;
  }
}
