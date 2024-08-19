import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-edit-member-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-member-dialog.component.html',
  styleUrl: './edit-member-dialog.component.scss',
})
export class EditMemberDialogComponent implements OnInit {
  dialogRef = inject(DialogRef);
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
