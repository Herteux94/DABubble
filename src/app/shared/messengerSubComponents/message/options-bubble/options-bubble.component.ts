import { ActiveUserService } from './../../../../services/active-user.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../../../models/message.model';
import { RoutingThreadOutletService } from '../../../../services/routing-thread-outlet.service';
import { ScreenSizeService } from '../../../../services/screen-size-service.service';
import { ActiveThreadService } from '../../../../services/active-thread-service.service';
import { FirestoreService } from '../../../../services/firestore.service';
import { ActiveChannelService } from '../../../../services/active-channel.service';
import { ActiveDirectMessageService } from '../../../../services/active-direct-message-service.service';
import { EmojiPickerComponent } from '../emoji-picker/emoji-picker.component';


@Component({
  selector: 'app-options-bubble',
  standalone: true,
  imports: [
    CommonModule,
    EmojiPickerComponent
  ],
  templateUrl: './options-bubble.component.html',
  styleUrls: ['./options-bubble.component.scss'],
})
export class OptionsBubbleComponent implements OnInit {
  @Output() emojiSelected = new EventEmitter<{ emoji: string, userID: string }>(); // Wir emitten ein Objekt
  @Output() editMessage = new EventEmitter<boolean>();
  @Input() ownMessage!: boolean;
  @Input() message!: Message;
  @Input() messengerType: string = '';
  messageOptionsOpen!: boolean;
  showEmojis: boolean = false;
  mobile!: boolean;

  constructor(
    public threadRoutingService: RoutingThreadOutletService,
    private screenSizeService: ScreenSizeService,
    private activeThreadService: ActiveThreadService,
    private firestoreService: FirestoreService,
    private activeChannelService: ActiveChannelService,
    private activeDirectMessageService: ActiveDirectMessageService,
    private activeUserService: ActiveUserService // ActiveUserService hinzufügen

  ) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

  // Zeigt den Emoji-Picker an
  showEmojiPicker() {
    this.showEmojis = true;
  }

// In der OptionsBubbleComponent
addEmoji(event: { emoji: string }) {
  const userID = this.activeUserService.activeUser?.userID; // Hole die User-ID des aktiven Benutzers
  if (userID) {
      this.emojiSelected.emit({ emoji: event.emoji, userID });  // Leite Emoji und User-ID weiter
  } else {
      console.error('No active user found.');
  }
}




  // Eine Beispielaktion, die etwas anderes macht
  someOtherAction() {
    console.log('Some other action triggered');
  }

  // Methode zum Handhaben der Reaktionen (Emojis)
  react(reaction: string) {
    console.log(`Reaction: ${reaction}`);
  }

  toggleMessageOptionsPopUp() {
    this.messageOptionsOpen = !this.messageOptionsOpen;
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

  editMsg() {
    this.toggleMessageOptionsPopUp();
    this.editMessage.emit(true);
  }

  deleteMessage() {
    if (this.messengerType == 'channels') {
      this.firestoreService.deleteMessage(
        this.message.messageID,
        this.messengerType,
        this.activeChannelService.activeChannel.channelID
      );
    } else if (this.messengerType == 'directMessages') {
      this.firestoreService.deleteMessage(
        this.message.messageID,
        this.messengerType,
        this.activeDirectMessageService.activeDM.directMessageID
      );
    } else if (this.messengerType == 'thread') {
      const updatedThreadLength =
        this.activeThreadService.activeThreadMessage.threadLength - 1;
      this.firestoreService.deleteThreadMessage(
        this.activeChannelService.activeChannel.channelID,
        this.activeThreadService.activeThreadMessage.messageID,
        this.message.messageID
      );
      this.firestoreService.updateMessage(
        {
          threadLength: updatedThreadLength,
        },
        'channels',
        this.activeChannelService.activeChannel.channelID,
        this.activeThreadService.activeThreadMessage.messageID
      );
      this.activeThreadService.activeThreadMessage.threadLength =
        updatedThreadLength;
    } else {
      console.error('Messenger Type not found.');
    }
  }
}
