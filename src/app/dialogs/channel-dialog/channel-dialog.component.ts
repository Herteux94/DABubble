import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { ScreenSizeService } from '../../services/screen-size-service.service';

@Component({
  selector: 'app-channel-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './channel-dialog.component.html',
  styleUrl: './channel-dialog.component.scss',
})
export class ChannelDialogComponent implements OnInit {
  contactData = {
    name: '',
  };
  isTriggered: boolean = false;
  isEditingName: boolean = false;
  isEditingDescription: boolean = false;
  channelName: string = 'Entwicklerteam';
  channelDescription: string = 'Dieser Channel ist für alles rund um #dsfdf vorgesehen. Hier kannst du zusammen mit deinem Team Meetings abhalten, Dokumente teilen und Entscheidungen treffen.';
  mobile: boolean = false;

  constructor(private screenSizeService: ScreenSizeService) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

  @ViewChild('channelNameInput') channelNameInput!: ElementRef;
  @ViewChild('channelDescriptionInput') channelDescriptionInput!: ElementRef;
  toggleEdit() {
    this.isEditingName = !this.isEditingName;
    if (this.isEditingName) {
      // Verstecke die Outline bei Bearbeitung
      setTimeout(() => {
        this.channelNameInput.nativeElement.focus();
      }, 0);
    }
  }

  toggleEditDescription() {
    this.isEditingDescription = !this.isEditingDescription;
    if (this.isEditingDescription) {
      // Verstecke die Outline bei Bearbeitung
      setTimeout(() => {
        this.channelDescriptionInput.nativeElement.focus();
      }, 0);
    }
  }

  onSubmit(ngForm: NgForm) {}
}
