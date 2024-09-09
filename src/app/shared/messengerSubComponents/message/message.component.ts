import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ProfileDialogComponent } from '../../../dialogs/profile-dialog/profile-dialog.component';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { RoutingThreadOutletService } from '../../../services/routing-thread-outlet.service';
import { ScreenSizeService } from '../../../services/screen-size-service.service';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { ActiveThreadService } from '../../../services/active-thread-service.service';
import { Message } from '../../../models/message.model';
import { OptionsBubbleComponent } from './options-bubble/options-bubble.component';
import { ImageFullscreenDialogComponent } from '../../../dialogs/image-fullscreen-dialog/image-fullscreen-dialog.component';
import { FirestoreService } from '../../../services/firestore.service';
import { FormsModule } from '@angular/forms';
import { ActiveChannelService } from '../../../services/active-channel.service';
import { ActiveDirectMessageService } from '../../../services/active-direct-message-service.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterModule,
    CommonModule,
    MatDialogModule,
    DialogModule,
    OptionsBubbleComponent,
    FormsModule,
  ],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent {
  @Input() ownMessage!: boolean;
  @Input() isChannel!: boolean;
  @Input() message!: Message;
  @Input() messengerType: string = '';

  mobile!: boolean;
  dialog = inject(Dialog);
  showOptions: boolean = false; // Flag zur Steuerung der Options-Bubble
  senderName!: string;
  senderAvatar!: string;
  editMessage: boolean = false;
  messageContentSnapshot = '';

  @ViewChild('editMsgTxtArea') editMsgTxtArea!: ElementRef;

  constructor(
    public threadRoutingService: RoutingThreadOutletService,
    private screenSizeService: ScreenSizeService,
    private activeThreadService: ActiveThreadService,
    private firestoreService: FirestoreService,
    private activeChannelService: ActiveChannelService,
    private activeDirectMessageService: ActiveDirectMessageService
  ) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });

    // Filtere ungültige URLs aus den Anhängen heraus
    if (this.message && this.message.attachments) {
      this.message.attachments = this.message.attachments.filter(
        (url) => url && url.trim() !== ''
      );
    } else {
      console.log('keine Message attachments vorhanden');
    }

    if (this.message && this.message.senderID) {
      this.loadSenderInfo(this.message.senderID);
    }

    if (this.message?.content) {
      this.messageContentSnapshot = this.message.content;
    }
  }

  loadSenderInfo(senderID: string) {
    this.firestoreService.allUsers$.subscribe((users) => {
      const sender = users.find((user) => user.userID === senderID);
      if (sender) {
        this.senderName = sender.name;
        this.senderAvatar =
          sender.profileImg || '../../../assets/img/Profile.svg';
      } else {
        console.warn('Sender nicht im Channel gefunden.');
      }
    });
  }

  openProfileDialog() {
    this.dialog.open(ProfileDialogComponent, {
      data: { userID: this.message.senderID },
    });
  }

  navigateToThread() {
    this.activeThreadService.loadActiveThreadAndMessages(
      this.message.messageID
    );

    this.threadRoutingService.openThread();

    if (this.mobile) {
      this.threadRoutingService.navigateToThreadMobile(this.message.messageID);
    } else {
      this.threadRoutingService.navigateToThreadDesktop(this.message.messageID);
    }
  }

  openFullscreenPreview(url: string) {
    this.dialog.open(ImageFullscreenDialogComponent, {
      data: { URL: url },
    });
  }

  onEditMessageChange(newValue: boolean) {
    this.editMessage = newValue;
    setTimeout(() => {
      this.editMsgTxtArea.nativeElement.focus();
    }, 200);
  }

  discardChanges() {
    this.editMessage = false;
    this.messageContentSnapshot = this.message.content;
  }

  saveChanges() {
    this.editMessage = false;
    this.message.content = this.messageContentSnapshot;
    if (this.messengerType == 'channels') {
      this.firestoreService.updateMessage(
        { content: this.message.content },
        this.messengerType,
        this.activeChannelService.activeChannel.channelID,
        this.message.messageID
      );
    } else if (this.messengerType == 'directMessages') {
      this.firestoreService.updateMessage(
        { content: this.message.content },
        this.messengerType,
        this.activeDirectMessageService.activeDM.directMessageID,
        this.message.messageID
      );
    } else if (this.messengerType == 'thread') {
      this.firestoreService.updateThreadMessage(
        { content: this.message.content },
        this.activeChannelService.activeChannel.channelID,
        this.activeThreadService.activeThreadMessage.messageID,
        this.message.messageID
      );
    } else {
      console.error('No Messenger Type found');
    }
  }
}
