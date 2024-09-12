import { ActiveUserService } from './../../../services/active-user.service';
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

  messageTimestampAsNumber!: number;
  messageTimestampAsDate!: any;

  mobile!: boolean;
  dialog = inject(Dialog);
  showOptions: boolean = false; // Flag zur Steuerung der Options-Bubble
  senderName!: string;
  senderAvatar!: string;
  editMessage: boolean = false;
  messageContentSnapshot = '';
  hoveredReactionUsers: string[] = [];

  @ViewChild('editMsgTxtArea') editMsgTxtArea!: ElementRef;

  constructor(
    private firestoreService: FirestoreService,
    private activeChannelService: ActiveChannelService,
    private activeDirectMessageService: ActiveDirectMessageService,
    private activeThreadService: ActiveThreadService,
    public threadRoutingService: RoutingThreadOutletService,
    private screenSizeService: ScreenSizeService,
    private activeUserService: ActiveUserService // ActiveUserService im Konstruktor injizieren
  ) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });

    if (this.message?.attachments && this.message?.senderID && this.message?.content && this.message?.creationTime) {
      this.message.attachments = this.message.attachments.filter(
        (url) => url && url.trim() !== ''
      );
      this.loadSenderInfo(this.message.senderID);
      this.messageContentSnapshot = this.message.content;
      this.messageTimestampAsNumber = this.message.creationTime.seconds * 1000;
    }

    // if (this.message?.senderID) {
    //   this.loadSenderInfo(this.message.senderID);
    // }

    // if (this.message?.content) {
    //   this.messageContentSnapshot = this.message.content;
    // }

    // if (this.message?.creationTime) {
    //   this.messageTimestampAsNumber = this.message.creationTime.seconds * 1000;
    // }
  }

  loadSenderInfo(senderID: string) {
    // this.firestoreService.allUsers$.subscribe((users) => {
      const sender = this.firestoreService.allUsers.find((user) => user.userID === senderID);
      if (sender) {
        this.senderName = sender.name;
        this.senderAvatar =
          sender.profileImg || '../../../assets/img/Profile.svg';
      } else {
        console.warn('Sender nicht im Channel gefunden.');
      }
    // }
  // );
  }

  // loadSenderInfo(senderID: string) {
  //   // this.firestoreService.allUsers$.subscribe((users) => {
  //     const sender = this.firestoreService.allUsers.find((user) => user.userID === senderID);
  //     if (sender) {
  //       this.senderName = sender.name;
  //       this.senderAvatar =
  //         sender.profileImg || '../../../assets/img/Profile.svg';
  //     } else {
  //       console.warn('Sender nicht im Channel gefunden.');
  //     }
  //   // }
  // // );
  // }

  // In der MessageComponent hinzufügen
  loadUserNamesForReaction(reactionUsers: string[]) {
    this.hoveredReactionUsers = []; // Leere die Liste, bevor neue Namen geladen werden

    this.firestoreService.allUsers$.subscribe((users) => {
      // Für jede User-ID den entsprechenden User finden und den Namen speichern
      reactionUsers.forEach((userID) => {
        const user = users.find((u) => u.userID === userID);
        if (user) {
          this.hoveredReactionUsers.push(user.name); // Füge den Namen zur Liste hinzu
        } else {
          this.hoveredReactionUsers.push('Unbekannt'); // Falls der User nicht gefunden wird
        }
      });
    });
  }

  addReaction(event: { emoji: string; userID: string }) {
    const { emoji, userID } = event; // Extrahiere Emoji und User-ID aus dem Event

    if (!this.message.reactions) {
      this.message.reactions = [];
    }

    const reaction = this.message.reactions.find((r) => r.emoji === emoji);

    if (reaction) {
      if (!reaction.users.includes(userID)) {
        reaction.count += 1;
        reaction.users.push(userID);
      }
    } else {
      this.message.reactions.push({ emoji, count: 1, users: [userID] });
    }

    this.saveMessageReactions();
  }

  saveMessageReactions() {
    const messageData = { reactions: this.message.reactions };

    if (this.messengerType === 'channels') {
      this.firestoreService.updateMessage(
        messageData,
        'channels',
        this.activeChannelService.activeChannel.channelID,
        this.message.messageID
      );
    } else if (this.messengerType === 'directMessages') {
      this.firestoreService.updateMessage(
        messageData,
        'directMessages',
        this.activeDirectMessageService.activeDM.directMessageID,
        this.message.messageID
      );
    } else if (this.messengerType === 'thread') {
      this.firestoreService.updateThreadMessage(
        messageData,
        this.activeChannelService.activeChannel.channelID,
        this.activeThreadService.activeThreadMessage.messageID,
        this.message.messageID
      );
    } else {
      console.error('Messenger Type not found.');
    }
  }

  removeReaction(emoji: string) {
    const userID = this.activeUserService.activeUser?.userID;

    if (!this.message.reactions) return;

    const reactionIndex = this.message.reactions.findIndex((r) => r.emoji === emoji);

    if (reactionIndex !== -1) {
      const reaction = this.message.reactions[reactionIndex];

      // Prüfen, ob der aktuelle User die Reaktion gemacht hat
      const userIndex = reaction.users.indexOf(userID!);

      if (userIndex !== -1) {
        // User aus der Reaktion entfernen
        reaction.users.splice(userIndex, 1);

        // Wenn keine User mehr auf diese Reaktion reagiert haben, Reaktion komplett entfernen
        if (reaction.users.length === 0) {
          this.message.reactions.splice(reactionIndex, 1);
        } else {
          // Sonst einfach die Anzahl der Reaktionen verringern
          reaction.count -= 1;
        }

        // Reaktionen nach Änderung speichern
        this.saveMessageReactions();
      }
    }
  }

  get activeUserID(): string | undefined {
    return this.activeUserService.activeUser?.userID || '';
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
