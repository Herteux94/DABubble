import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { User } from '../../models/user.model';
import { Channel } from '../../models/channel.model';

@Component({
  selector: 'app-create-member-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-member-dialog.component.html',
  styleUrl: './create-member-dialog.component.scss'
})
export class CreateMemberDialogComponent implements OnInit {
  user!: User;
  channel!: Channel;
  contactData = {
    name: ''
  };
  selectedMemberType: string = 'allMember';
  mobile: boolean = false;

  constructor(private screenSizeService: ScreenSizeService) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }
  onSubmit(ngForm: NgForm) {
    
  }

}
