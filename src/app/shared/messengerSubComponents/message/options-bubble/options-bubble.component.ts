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

  /**
   * Constructor for the OptionsBubbleComponent.
   *
   * @param threadRoutingService An instance of the RoutingThreadOutletService, used to navigate to a thread.
   * @param screenSizeService An instance of the ScreenSizeService, used to determine whether the client is a mobile device.
   * @param activeThreadService An instance of the ActiveThreadService, used to get the active thread.
   * @param firestoreService An instance of the FirestoreService, used to get a message.
   * @param activeChannelService An instance of the ActiveChannelService, used to get the active channel.
   * @param activeDirectMessageService An instance of the ActiveDirectMessageService, used to get the active direct message.
   * @param activeUserService An instance of the ActiveUserService, used to get the active user.
   * @param el The ElementRef of the component, used to get the element.
   */
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

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   * Subscribes to the isMobile observable of the ScreenSizeService and sets the mobile property of the component
   * to the value received from the observable.
   */
  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

  /**
   * Toggles the emoji picker and sets the direction of the picker (up or down) based on the position of the options bubble.
   * The direction is determined by checking whether the bottom of the options bubble is above or below the halfway point of the
   * window's height.
   */
  toggleEmojiPicker() {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    this.emojiPickerDirection = rect.bottom > windowHeight / 2 ? 'up' : 'down';

    this.showEmojis = !this.showEmojis;
  }

  /**
   * Handles emoji selection and passes it to the parent component.
   * The selected emoji and the ID of the active user are emitted as an object.
   * If no active user is found, a console error is logged.
   * @param event The event containing the selected emoji.
   */
  addEmoji(event: { emoji: string }) {
    const userID = this.activeUserService.activeUser?.userID;
    if (userID) {
      this.emojiSelected.emit({ emoji: event.emoji, userID });
      this.showEmojis = false;
    } else {
      console.error('No active user found.');
    }
  }

  /**
   * Toggles the message options popup and emits an event to the parent
   * component to enable editing of the message.
   */
  editMsg() {
    this.toggleMessageOptionsPopUp();
    this.editMessage.emit(true);
  }

  /**
   * Deletes a message document in the Firestore database.
   * The message belongs to either a channel, a direct message or a thread.
   * The type of messenger is determined by the value of `messengerType`.
   * If `messengerType` is not one of the above values, a console error is logged.
   */
  deleteMessage() {
    if (this.messengerType === 'channels') {
      this.deleteChannelMessage();
    } else if (this.messengerType === 'directMessages') {
      this.deleteDirectMessage();
    } else if (this.messengerType === 'thread') {
      this.deleteThreadMessage();
    } else {
      console.error('Messenger Type not found.');
    }
  }

  /**
   * Deletes a channel message document in the Firestore database.
   * The message belongs to a channel.
   */
  deleteChannelMessage() {
    this.firestoreService.deleteMessage(
      this.message.messageID,
      this.messengerType,
      this.activeChannelService.activeChannel.channelID
    );
  }

  /**
   * Deletes a direct message document in the Firestore database.
   * The message belongs to a direct message.
   */
  deleteDirectMessage() {
    this.firestoreService.deleteMessage(
      this.message.messageID,
      this.messengerType,
      this.activeDirectMessageService.activeDM.directMessageID
    );
  }

  /**
   * Deletes a thread message document in the Firestore database. The message
   * belongs to a thread which belongs to a channel.
   *
   * @remarks
   * Decreases the `threadLength` field of the parent thread message by 1 and sets
   * the `threadLength` field of the `activeThreadMessage` to the updated value.
   */
  deleteThreadMessage() {
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
  }

  /**
   * Toggles the message options popup on and off.
   *
   * Emits an event to the parent component to enable or disable the message options
   * popup. The popup is displayed when the message options are open and hidden when
   * the message options are closed.
   */
  toggleMessageOptionsPopUp() {
    this.messageOptionsOpen = !this.messageOptionsOpen;
  }

  /**
   * Navigates to the thread view of the message.
   *
   * Loads the active thread message and its messages by calling the
   * loadActiveThreadAndMessages method. Then, it navigates to the thread view
   * of the message by either calling the navigateToThreadMobile or
   * navigateToThreadDesktop methods depending on whether the client is a
   * mobile device or not. Finally, it emits an event to the parent component
   * to load the sender info.
   */
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

  /**
   * Handles emoji selection and passes it to the parent component.
   * The selected emoji and the ID of the active user are emitted as an object.
   * If no active user is found, a console error is logged.
   * @param event The event containing the selected emoji.
   */
  onEmojiSelected(event: { emoji: string }) {
    const userID = this.activeUserService.activeUser?.userID; // Hole die aktuelle UserID
    if (userID) {
      this.emojiSelected.emit({ emoji: event.emoji, userID }); // Übergib das vollständige Objekt
    } else {
      console.error('No active user found.');
    }
    this.showEmojis = false;
  }

  /**
   * Handles an SVG emoji click and passes it to the parent component.
   * The selected emoji and the ID of the active user are emitted as an object.
   * If no active user is found, a console error is logged.
   * @param emoji The selected emoji.
   */
  onSvgClick(emoji: string) {
    const userID = this.activeUserService.activeUser?.userID;
    if (userID) {
      this.emojiSelected.emit({ emoji, userID });
    } else {
      console.error('No active user found.');
    }
  }
}
