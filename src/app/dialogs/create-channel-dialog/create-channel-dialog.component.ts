import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { DialogRef } from '@angular/cdk/dialog';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Channel } from '../../models/channel.model';
import { ActiveUserService } from '../../services/active-user.service';
import { FirestoreService } from '../../services/firestore.service';
import { FormsModule, NgForm } from '@angular/forms';
@Component({
  selector: 'app-create-channel-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-channel-dialog.component.html',
  styleUrl: './create-channel-dialog.component.scss',
  animations: [
    trigger('dialogAnimationFadeIn', [
      state('void', style({ opacity: 0, transform: 'scale(0.3)' })),
      state('*', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void => *', [
        animate('300ms ease-out')
      ]),
      transition('* => void', [
        animate('200ms ease-in')
      ])
    ]),
  ]
})
export class CreateChannelDialogComponent implements OnInit {

  dialogRef = inject(DialogRef);
  channel!: Channel;
  createdChannel = {
    name: '',
    description:''
  };
  @ViewChild('contactForm') contactForm!: NgForm;
  mobile: boolean = false;

  constructor(private el: ElementRef, private screenSizeService: ScreenSizeService, private activeUserService: ActiveUserService, private firestoreService: FirestoreService) {}
 
  /**
   * Lifecycle hook that is called after the component is initialized.
   * It checks for the screen size and stores the result in the mobile variable.
   */
  ngOnInit() {
    this.screenSizeService.isMobile().subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }

  /**
   * Submits the form and creates a new channel in the Firestore database.
   *
   * Checks if the form is valid and creates a new channel with the given name and description.
   * The creator of the channel is the currently active user.
   * The creation time of the channel is set to the current time.
   * The member array of the channel is set to an array containing the user ID of the active user.
   * If the form is invalid, a message is logged to the console and the dialog is not closed.
   * If the creation of the channel is successful, the dialog is closed.
   */
  async onSubmit() {
    if (this.contactForm.valid) {
      const newChannel = new Channel();
      newChannel.name = this.createdChannel.name!;
      newChannel.creator = this.activeUserService.activeUser.name;
      newChannel.description = this.createdChannel.description!;
      newChannel.creationTime = Date.now();
      newChannel.member = [this.activeUserService.activeUser.userID];

      try {
        await this.firestoreService.addChannel(newChannel.toJSON(), this.activeUserService.activeUser.userID);
        console.log('channel: ', newChannel);
        console.log('active User: ', this.activeUserService.activeUser.userID);
        this.dialogRef.close();
      } catch (error) {
        console.error('Fehler beim Erstellen des Channels:', error);
      }
    } else {
      console.log('Formular ist ungültig, wird nicht gesendet.');
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  /**
   * Handles the enter key being pressed when the user is inside this dialog.
   *
   * Prevents the default behavior of the enter key and calls the `onSubmit`
   * method to create a new channel if the form is valid.
   * @param event The KeyboardEvent that triggered this function.
   */
  handleEnterKey(event: KeyboardEvent) {
    const activeElement = document.activeElement;
    if (this.el.nativeElement.contains(activeElement)) {
      event.preventDefault();
      this.onSubmit();
    }
  }
}
