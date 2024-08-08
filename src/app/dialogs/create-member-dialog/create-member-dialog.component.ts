import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-member-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-member-dialog.component.html',
  styleUrl: './create-member-dialog.component.scss'
})
export class CreateMemberDialogComponent {

  contactData = {
    name: ''
  };

  onSubmit(ngForm: NgForm) {
    
  }

}
