import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Channel } from '../../models/channel.model';
import { ActiveUserService } from '../../services/active-user.service';
import { FirestoreService } from '../../services/firestore.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CreateMemberDialogComponent } from '../create-member-dialog/create-member-dialog.component';
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
      transition('void => *', [animate('300ms ease-out')]),
      transition('* => void', [animate('200ms ease-in')]),
    ]),
  ],
})
export class CreateChannelDialogComponent implements OnInit {
  dialog = inject(Dialog);
  dialogRef = inject(DialogRef);
  channel!: Channel;
  createdChannel = {
    name: '',
    description: '',
  };
  @ViewChild('contactForm') contactForm!: NgForm;
  mobile: boolean = false;

  constructor(
    private el: ElementRef,
    private screenSizeService: ScreenSizeService,
    private activeUserService: ActiveUserService,
    private firestoreService: FirestoreService
  ) {}

  /**
   * Lifecycle hook that is called after the component is initialized.
   * It checks for the screen size and stores the result in the mobile variable.
   */
  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

  /**
   * Submits the channel creation dialog form if it is valid.
   *
   * It creates a new channel with the given name, description, and the user as the creator and the first member.
   * It then closes the dialog and opens the create member dialog with the newly created channel.
   *
   * @remarks
   * If the form is not valid, it will log a message to the console and not send the form.
   */
async onSubmit() {
  if (this.contactForm.valid) {
    const newChannel = new Channel();
    newChannel.name = this.createdChannel.name!;
    newChannel.creator = this.activeUserService.activeUser.name;
    newChannel.description = this.createdChannel.description!;
    newChannel.creationTime = Date.now();
    newChannel.member = [this.activeUserService.activeUser.userID];

    // if (!this.mobile) {
      this.dialogRef.close();
    // }

    this.openCreateMemberDialog(newChannel);
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

  /**
   * Opens the CreateMemberDialogComponent to add members to the newly created channel.
   *
   * @param channelData The newly created channel, which is passed to the dialog as data.
   */
  openCreateMemberDialog(channelData: Channel) {
    this.dialog.open(CreateMemberDialogComponent, {
      data: {
        channel: channelData
      },
    });
  }
}
