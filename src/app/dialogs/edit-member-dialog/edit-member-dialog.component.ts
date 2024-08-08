import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-member-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-member-dialog.component.html',
  styleUrl: './edit-member-dialog.component.scss'
})
export class EditMemberDialogComponent {
  
  contactData = {
    name: ''
  };

  onSubmit(ngForm: NgForm) {
    
  }

}
