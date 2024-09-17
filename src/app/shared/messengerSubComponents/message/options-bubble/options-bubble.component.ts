import { ActiveUserService } from './../../../../services/active-user.service';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ElementRef,
  ViewChild,
} from '@angular/core';
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
  imports: [CommonModule, EmojiPickerComponent],
  templateUrl: './options-bubble.component.html',
  styleUrls: ['./options-bubble.component.scss'],
})
export class OptionsBubbleComponent implements OnInit {
  @Output() emojiSelected = new EventEmitter<{
    emoji: string;
    userID: string;
  }>(); // Emit an object containing emoji and userID
  @Output() editMessage = new EventEmitter<boolean>();
  @Output() senderInfoRequested: EventEmitter<string> =
    new EventEmitter<string>();
  @Input() ownMessage!: boolean;
  @Input() message!: Message;
  @Input() messengerType: string = '';

  messageOptionsOpen!: boolean;
  showEmojis: boolean = false;
  mobile!: boolean;
  emojiPickerDirection: 'up' | 'down' = 'down'; // Determines whether the emoji picker opens upwards or downwards

  @ViewChild('emojiPicker') emojiPicker!: ElementRef;

  constructor(
    public threadRoutingService: RoutingThreadOutletService,
    private screenSizeService: ScreenSizeService,
    private activeThreadService: ActiveThreadService,
    private firestoreService: FirestoreService,
    private activeChannelService: ActiveChannelService,
    private activeDirectMessageService: ActiveDirectMessageService,
    private activeUserService: ActiveUserService,
    private el: ElementRef
  ) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

  // Method to show or hide the emoji picker
  toggleEmojiPicker() {
    const rect = this.el.nativeElement.getBoundingClientRect(); // Get position of the options bubble
    const windowHeight = window.innerHeight;

    // Decide whether the picker opens upwards or downwards
    this.emojiPickerDirection = rect.bottom > windowHeight / 2 ? 'up' : 'down';

    // Show or hide the emoji picker
    this.showEmojis = !this.showEmojis;
  }

  // Handle emoji selection and pass it to the parent component
  addEmoji(event: { emoji: string }) {
    const userID = this.activeUserService.activeUser?.userID; // Get active user's ID
    if (userID) {
      this.emojiSelected.emit({ emoji: event.emoji, userID }); // Emit emoji and userID
      this.showEmojis = false; // Close the emoji picker after selection
    } else {
      console.error('No active user found.');
    }
  }

  editMsg() {
    this.toggleMessageOptionsPopUp();
    this.editMessage.emit(true);
  }

  deleteMessage() {
    if (this.messengerType === 'channels') {
      this.firestoreService.deleteMessage(
        this.message.messageID,
        this.messengerType,
        this.activeChannelService.activeChannel.channelID
      );
    } else if (this.messengerType === 'directMessages') {
      this.firestoreService.deleteMessage(
        this.message.messageID,
        this.messengerType,
        this.activeDirectMessageService.activeDM.directMessageID
      );
    } else if (this.messengerType === 'thread') {
      const updatedThreadLength =
        this.activeThreadService.activeThreadMessage.threadLength - 1;
      this.firestoreService.deleteThreadMessage(
        this.activeChannelService.activeChannel.channelID,
        this.activeThreadService.activeThreadMessage.messageID,
        this.message.messageID
      );
      this.firestoreService.updateMessage(
        { threadLength: updatedThreadLength },
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

  toggleMessageOptionsPopUp() {
    this.messageOptionsOpen = !this.messageOptionsOpen;
  }

  // Load the thread view
  navigateToThread() {
    this.activeThreadService.loadActiveThreadAndMessages(
      this.message.messageID
    );

    if (this.mobile) {
      this.threadRoutingService.navigateToThreadMobile(this.message.messageID);
    } else {
      this.threadRoutingService.openThread();
      this.threadRoutingService.navigateToThreadDesktop(this.message.messageID);
    }
    this.senderInfoRequested.emit(this.message.senderID);
  }

  onEmojiSelected(event: { emoji: string }) {
    const userID = this.activeUserService.activeUser?.userID; // Hole die aktuelle UserID
    if (userID) {
      this.emojiSelected.emit({ emoji: event.emoji, userID }); // Übergib das vollständige Objekt
    } else {
      console.error('No active user found.');
    }
    this.showEmojis = false;
  }

  onSvgClick(emoji: string) {
    const userID = this.activeUserService.activeUser?.userID;
    if (userID) {
      this.emojiSelected.emit({ emoji, userID });
    } else {
      console.error('No active user found.');
    }
  }
}
