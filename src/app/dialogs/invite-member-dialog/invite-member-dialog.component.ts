import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-invite-member-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './invite-member-dialog.component.html',
  styleUrl: './invite-member-dialog.component.scss'
})
export class InviteMemberDialogComponent {

  contactData = {
    name: ''
  };

  onSubmit(ngForm: NgForm) {
    
  }
}
