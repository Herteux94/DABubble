import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { InviteMemberDialogComponent } from '../invite-member-dialog/invite-member-dialog.component';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { EditMemberDialogComponent } from '../edit-member-dialog/edit-member-dialog.component';
import { Channel } from '../../models/channel.model';
import { ActiveChannelService } from '../../services/active-channel.service';
import { FirestoreService } from '../../services/firestore.service';
import { ActiveUserService } from '../../services/active-user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-channel-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule, InviteMemberDialogComponent],
  templateUrl: './channel-dialog.component.html',
  styleUrl: './channel-dialog.component.scss',
  animations: [
    trigger('dialogAnimationFadeIn', [
      state('void', style({ opacity: 0, transform: 'scale(0.3)' })),
      state('*', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void => *', [animate('300ms ease-out')]),
      transition('* => void', [animate('200ms ease-in')]),
    ]),
    trigger('inputAnimationFadeIn', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void => *', [animate('300ms ease-out')]),
      transition('* => void', [animate('200ms ease-in')]),
    ]),
    trigger('dialogAnimationFadeInSlideUp', [
      state('void', style({ opacity: 0, transform: 'translateY(100px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [animate('400ms ease-out')]),
      transition('* => void', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'translateY(100px)' })
        ),
      ]),
    ]),
    trigger('dialogAnimationZoomInBounce', [
      //nicht schön
      state('void', style({ transform: 'scale(0.5)' })),
      state('*', style({ transform: 'scale(1)' })),
      transition('void => *', [
        animate('300ms cubic-bezier(.68,-0.55,.27,1.55)'),
      ]),
      transition('* => void', [
        animate('200ms ease-out', style({ transform: 'scale(0.5)' })),
      ]),
    ]),
    trigger('dialogAnimationSlideInRight', [
      state('void', style({ transform: 'translateX(100%)', opacity: 0 })),
      state('*', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('void => *', [animate('300ms ease-in')]),
      transition('* => void', [
        animate(
          '300ms ease-out',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),
    ]),
    trigger('dialogAnimationRotateIn', [
      state('void', style({ transform: 'rotate(-90deg)', opacity: 0 })),
      state('*', style({ transform: 'rotate(0)', opacity: 1 })),
      transition('void => *', [animate('400ms ease-out')]),
      transition('* => void', [
        animate(
          '300ms ease-in',
          style({ transform: 'rotate(90deg)', opacity: 0 })
        ),
      ]),
    ]),
    trigger('dialogAnimationFlipIn', [
      state(
        'void',
        style({ transform: 'perspective(600px) rotateX(-90deg)', opacity: 0 })
      ),
      state(
        '*',
        style({ transform: 'perspective(600px) rotateX(0)', opacity: 1 })
      ),
      transition('void => *', [
        animate('500ms cubic-bezier(0.25, 0.8, 0.25, 1)'),
      ]),
      transition('* => void', [
        animate(
          '400ms ease-in',
          style({ transform: 'perspective(600px) rotateX(90deg)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class ChannelDialogComponent implements OnInit {
  dialogRef = inject(DialogRef);
  dialog = inject(Dialog);
  channel!: Channel;
  isTriggered: boolean = false;
  isEditingName: boolean = false;
  isEditingDescription: boolean = false;
  channelName: string = this.activeChannelService.activeChannel.name;
  channelDescription: string =
    this.activeChannelService.activeChannel.description;
  channelCreator: string = this.activeChannelService.activeChannel.creator;
  mobile: boolean = false;

  constructor(
    private screenSizeService: ScreenSizeService,
    public activeChannelService: ActiveChannelService,
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService,
    private router: Router
  ) {}

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
      }, 10);
    } else if (!this.isEditingName) {
      this.saveNewDescription();
    }
  }

  adjustTextareaRows(textarea: HTMLTextAreaElement): void {
    // Setze die Anzahl der Zeilen zurück, um die korrekte Höhe zu berechnen
    textarea.rows = 1;

    // Berechne die Anzahl der benötigten Zeilen basierend auf der Scrollhöhe
    const lineHeight = 24; // Die Höhe einer Zeile in px (kann je nach Schriftgröße variieren)
    const currentRows = Math.floor(textarea.scrollHeight / lineHeight);

    // Setze die Anzahl der Zeilen auf die aktuelle Höhe, begrenzt auf maximal 4 Zeilen
    textarea.rows = currentRows <= 4 ? currentRows : 4;
  }

  getUserData(userID: string) {
    return userID;
  }

  saveNewName() {
    this.activeChannelService.activeChannel.name = this.channelName;
    this.firestoreService.updateChannel(
      { name: this.channelName },
      this.activeChannelService.activeChannel.channelID
    );
    console.log('Channel name updated successfully');
  }

  saveNewDescription() {
    this.activeChannelService.activeChannel.description =
      this.channelDescription;
    this.firestoreService.updateChannel(
      { description: this.channelDescription },
      this.activeChannelService.activeChannel.channelID
    );
    console.log('Channel description updated successfully');
  }

  onEvent(event: any) {
    event.stopPropagation();
  }

  openEditMemberDialog() {
    this.dialog.open(EditMemberDialogComponent);
  }

  leaveChannel() {
    const userID = this.activeUserService.activeUser.userID;
    const channel = this.activeChannelService.activeChannel;

    const updatedMembers = channel.member.filter(
      (memberID: string) => memberID !== userID
    );
    const updatedUserChannels =
      this.activeUserService.activeUser.channels.filter(
        (channelID: string) => channelID !== channel.channelID
      );

    this.firestoreService.updateChannel(
      { member: updatedMembers },
      channel.channelID
    );
    this.firestoreService.updateUser({ channels: updatedUserChannels }, userID);
    this.navigateToHelloComponent();
  }

  navigateToHelloComponent() {
    this.router.navigate(['messenger/hello']);
  }
}
