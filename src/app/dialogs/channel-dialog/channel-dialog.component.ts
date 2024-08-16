import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { InviteMemberDialogComponent } from '../invite-member-dialog/invite-member-dialog.component';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-channel-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule, InviteMemberDialogComponent],
  templateUrl: './channel-dialog.component.html',
  styleUrl: './channel-dialog.component.scss',
})
export class ChannelDialogComponent implements OnInit {
  dialogRef = inject(DialogRef);

  contactData = {
    name: '',
  };
  isTriggered: boolean = false;
  isEditingName: boolean = false;
  isEditingDescription: boolean = false;
  channelName: string = 'Entwicklerteam';
  channelDescription: string =
    'Dieser Channel ist für alles rund um #dsfdf vorgesehen. Hier kannst du zusammen mit deinem Team Meetings abhalten, Dokumente teilen und Entscheidungen treffen.';
  mobile: boolean = false;

  constructor(private screenSizeService: ScreenSizeService) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

  @ViewChild('channelNameInput') channelNameInput!: ElementRef;
  @ViewChild('channelDescriptionInput') channelDescriptionInput!: ElementRef;
  toggleEditName() {
    this.isEditingName = !this.isEditingName;
    if (this.isEditingName) {
      setTimeout(() => {
        this.channelNameInput.nativeElement.focus();
      }, 10);
    } else if (!this.isEditingName) {
      this.saveNewName();
    }
  }

  toggleEditDescription() {
    this.isEditingDescription = !this.isEditingDescription;
    if (this.isEditingDescription) {
      setTimeout(() => {
        this.channelDescriptionInput.nativeElement.focus();
      }, 0);
    } else if (!this.isEditingName) {
      this.saveNewDescription();
    }
  }

  onSubmit(ngForm: NgForm) {}

  saveNewName() {
    console.log('saveNewName hat geklappt');
  }

  saveNewDescription() {
    console.log('saveNewDescription hat geklappt');
  }

  onEvent(event: any) {
    event.stopPropagation();
  }
}
