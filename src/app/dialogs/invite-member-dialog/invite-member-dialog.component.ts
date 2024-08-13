import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { DialogsService } from '../../services/dialogs.service';

@Component({
  selector: 'app-invite-member-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './invite-member-dialog.component.html',
  styleUrl: './invite-member-dialog.component.scss',
})
export class InviteMemberDialogComponent implements OnInit {
  contactData = {
    name: '',
  };

  mobile: boolean = false;

  constructor(private screenSizeService: ScreenSizeService, private dialogService: DialogsService) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

  close() {
    this.dialogService.closeDialog();
  }
  
  onSubmit(ngForm: NgForm) {}
}
