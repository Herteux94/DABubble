import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { Dialog, DIALOG_DATA, DialogModule, DialogRef } from '@angular/cdk/dialog';
import { User } from '@angular/fire/auth';
import { Channel } from '../../models/channel.model';

@Component({
  selector: 'app-invite-member-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './invite-member-dialog.component.html',
  styleUrl: './invite-member-dialog.component.scss',
})
export class InviteMemberDialogComponent implements OnInit {
  dialogRef = inject(DialogRef);
  data = inject(DIALOG_DATA);
  user!: User;
  channel!: Channel;

  contactData = {
    name: '',
  };

  mobile: boolean = false;

  constructor(private screenSizeService: ScreenSizeService) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }
  onSubmit(ngForm: NgForm) {}

}
