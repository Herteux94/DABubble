import { ActiveUserService } from './../../../services/active-user.service';
import {
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  ViewChild,
  OnChanges,
  SimpleChanges
} from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

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
    MatTooltipModule,
  ],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnDestroy, OnChanges {
  @Input() ownMessage!: boolean;
  @Input() isChannel!: boolean;
  @Input() message!: Message;
  @Input() messengerType: string = '';

  messageTimestampAsNumber!: number;
  messageLastAnswerAsNumber!: number;
  mobile!: boolean;
  dialog = inject(Dialog);
  showOptions: boolean = false;
  senderName!: string;
  senderAvatar!: string;
  editMessage: boolean = false;
  messageContentSnapshot = '';
  hoveredReactionUsers: string[] = [];
  private screenSizeSubscription: Subscription | null = null;

  @ViewChild('editMsgTxtArea') editMsgTxtArea!: ElementRef;

  constructor(
    private firestoreService: FirestoreService,
    private activeChannelService: ActiveChannelService,
    private activeDirectMessageService: ActiveDirectMessageService,
    private activeThreadService: ActiveThreadService,
    public threadRoutingService: RoutingThreadOutletService,
    private screenSizeService: ScreenSizeService,
    private activeUserService: ActiveUserService
  ) {}

  /**
   * OnInit lifecycle hook. Initializes the component by subscribing to the mobile
   * screen size observable and filtering out empty attachment URLs.
   *
   * @returns void
   */
  ngOnInit() {
    this.screenSizeSubscription = this.screenSizeService
      .isMobile()
      .subscribe((isMobile) => {
        this.mobile = isMobile;
      });
    if (this.message?.attachments && this.message?.content) {
      this.message.attachments = this.message.attachments.filter(
        (url) => url && url.trim() !== ''
      );
      this.messageContentSnapshot = this.message.content;
    }
  }

  /**
   * Lifecycle hook that is called when the input properties of the component change.
   * If the 'message' property has changed, it loads the sender information and timestamps
   * of the message.
   *
   * @param changes The changes object that contains the changed input properties.
   * @returns void
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['message']) {
      if (this.message?.senderID) {
        this.loadSenderInfo(this.message.senderID);
      }
      if (this.message?.creationTime) {
        this.messageTimestampAsNumber = this.message.creationTime.seconds * 1000;
      }
      if (this.message?.lastAnswer) {
        this.messageLastAnswerAsNumber = this.message.lastAnswer.seconds * 1000;
      }
    }
  }


  /**
   * Loads the sender information of the message.
   *
   * It searches the active user service's allUsers array for a user with the given
   * sender ID. If it finds one, it assigns the user's name and profile image URL
   * to the senderName and senderAvatar properties, respectively.
   *
   * @param senderID The ID of the user who sent the message.
   * @returns void
   */
  loadSenderInfo(senderID: string) {
    const sender = this.firestoreService.allUsers.find(
      (user) => user.userID === senderID
    );
    if (sender) {
      this.senderName = sender.name;
      this.senderAvatar =
        sender.profileImg || '../../../assets/img/Profile.svg';
    }
  }

  /**
   * Loads the user names of the users who reacted to the message with the given emoji.
   *
   * It subscribes to the allUsers$ observable and loads the user names when the observable emits a new value.
   * When the observable emits a new value, it assigns the user names to the hoveredReactionUsers property.
   * The subscription is automatically unsubscribed when the service is destroyed.
   *
   * @param reactionUsers The IDs of the users who reacted to the message with the given emoji.
   * @returns void
   */
  loadUserNamesForReaction(reactionUsers: string[]) {
    this.hoveredReactionUsers = [];

    this.firestoreService.allUsers$.subscribe((users) => {
      reactionUsers.forEach((userID) => {
        const user = users.find((u) => u.userID === userID);
        if (user) {
          this.hoveredReactionUsers.push(user.name);
        } else {
          this.hoveredReactionUsers.push('Unbekannt');
        }
      });
    });
  }

  /**
   * Adds a reaction to a message or updates an existing reaction.
   *
   * If the message does not have any reactions, it creates a new reaction with the given emoji and user ID.
   * If the message already has a reaction with the given emoji, it increments the count of the reaction and
   * adds the user ID to the list of users who reacted with the given emoji.
   * If the user ID is already in the list of users who reacted with the given emoji, it does not increment the count
   * or add the user ID again.
   *
   * After adding or updating the reaction, it saves the message reactions to the Firestore database.
   *
   * @param event The event that contains the emoji and user ID to add to the message reactions.
   * @returns void
   */
  addReaction(event: { emoji: string; userID: string }) {
    const { emoji, userID } = event;

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

  /**
   * Saves the message reactions to the Firestore database.
   *
   * It takes the reactions array of the message and saves it to the Firestore database.
   * The reactions are saved to the "messages" subcollection of the given messenger type and messenger ID.
   * If the messenger type is "thread", it saves the reactions to the "threadMessages" subcollection of the given channel and message.
   *
   * @returns void
   */
  saveMessageReactions() {
    const messageData = { reactions: this.message.reactions };

    if (this.messengerType === 'channels') {
      this.firestoreService.updateMessage(
        messageData,
        this.messengerType,
        this.activeChannelService.activeChannel.channelID,
        this.message.messageID
      );
    } else if (this.messengerType === 'directMessages') {
      this.firestoreService.updateMessage(
        messageData,
        this.messengerType,
        this.activeDirectMessageService.activeDM.directMessageID,
        this.message.messageID
      );
    } else if (this.messengerType === 'thread') {
      this.firestoreService.updateThreadMessage(
        messageData,
        this.activeChannelService.activeChannel.channelID, // channelID
        this.message.messageID, // messageID (übergeordnete Nachricht)
        this.activeThreadService.activeThreadMessage.messageID // threadID
      );
    } else {
      console.error('No Messenger Type found.');
    }
  }

  /**
   * Removes a reaction from a message and saves the changes to the Firestore database.
   *
   * It searches for the reaction with the given emoji in the message's reactions array.
   * If it finds one, it removes the active user's ID from the reaction's users array.
   * If the reaction's users array becomes empty, it removes the reaction from the message.
   * Finally, it saves the updated reactions array to the Firestore database.
   *
   * @param emoji The emoji of the reaction to remove.
   * @returns void
   */
  removeReaction(emoji: string) {
    const userID = this.activeUserService.activeUser?.userID;

    if (!this.message.reactions) return;

    const reactionIndex = this.message.reactions.findIndex(
      (r) => r.emoji === emoji
    );

    if (reactionIndex !== -1) {
      const reaction = this.message.reactions[reactionIndex];

      const userIndex = reaction.users.indexOf(userID!);

      if (userIndex !== -1) {
        reaction.users.splice(userIndex, 1);

        if (reaction.users.length === 0) {
          this.message.reactions.splice(reactionIndex, 1);
        } else {
          reaction.count -= 1;
        }

        this.saveMessageReactions();
      }
    }
  }

  /**
   * Returns the ID of the active user, or an empty string if no user is active.
   * @returns The ID of the active user, or an empty string.
   */
  get activeUserID(): string | undefined {
    return this.activeUserService.activeUser?.userID || '';
  }

  /**
   * Opens the profile dialog of the user who sent the message.
   *
   * Opens a new dialog with the given user as the user to show in the dialog.
   * The ID of the user who sent the message is passed as data to the dialog.
   */
  openProfileDialog() {
    this.dialog.open(ProfileDialogComponent, {
      data: { userID: this.message.senderID },
    });
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
    this.loadSenderInfo(this.message.senderID);

    if (this.mobile) {
      this.threadRoutingService.navigateToThreadMobile(this.message.messageID);
    } else {
      this.threadRoutingService.navigateToThreadDesktop(this.message.messageID);
      this.threadRoutingService.openThread();
    }
  }

  /**
   * Opens a new dialog with the given URL as the image to show in full screen.
   *
   * The given URL is passed as data to the dialog, which is an instance of
   * ImageFullscreenDialogComponent. The dialog shows the image in full screen
   * and has a close button to close the dialog.
   * @param url The URL of the image to show in full screen.
   */
  openFullscreenPreview(url: string) {
    this.dialog.open(ImageFullscreenDialogComponent, {
      data: { URL: url },
    });
  }

  /**
   * Toggles the editing mode of the message.
   *
   * If `newValue` is true, the message will be editable and the edit message
   * text area will be focused after a short delay. If `newValue` is false, the
   * message will not be editable and the edit message text area will be
   * blurred. The delay is used to prevent the text area from being focused
   * before the animation of the edit message text area is finished.
   * @param newValue Whether the message should be editable or not.
   */
  onEditMessageChange(newValue: boolean) {
    this.editMessage = newValue;
    setTimeout(() => {
      this.editMsgTxtArea.nativeElement.focus();
    }, 200);
  }

  /**
   * Discards any changes made to the message content.
   *
   * If the message is currently being edited, this function will discard the
   * changes and set the message content back to its original value. The
   * `editMessage` flag is also set to `false` to indicate that the message is
   * no longer being edited.
   */
  discardChanges() {
    this.editMessage = false;
    this.messageContentSnapshot = this.message.content;
  }

  /**
   * Saves the changes made to the message content.
   *
   * If the message is currently being edited, this function will save the
   * changes and set the message content to the new value. The `editMessage`
   * flag is also set to `false` to indicate that the message is no longer being
   * edited. The changes are saved to the Firestore database by calling one of
   * the following functions, depending on the type of messenger:
   * - `updateChannelMessage()` if the messenger type is "channels"
   * - `updateDirectMessage()` if the messenger type is "directMessages"
   * - `updateThreadMessage()` if the messenger type is "thread"
   * If the messenger type is not one of the above values, a console error is
   * logged.
   */
  saveChanges() {
    this.editMessage = false;
    this.message.content = this.messageContentSnapshot;
    if (this.messengerType === 'channels') {
      this.updateChannelMessage();
    } else if (this.messengerType === 'directMessages') {
      this.updateDirectMessage();
    } else if (this.messengerType === 'thread') {
      this.updateThreadMessage();
    } else {
      console.error('No Messenger Type found');
    }
  }

  /**
   * Updates a channel message document in the Firestore database with the given
   * message data.
   *
   * @param messageData The partial message data to be used for the update.
   * @param messengerType The type of messenger (either "channels" or "directMessages").
   * @param messengerID The ID of the channel or direct message to which the message belongs.
   * @param messageID The ID of the message document to be updated.
   */
  updateChannelMessage() {
    this.firestoreService.updateMessage(
      { content: this.message.content },
      this.messengerType,
      this.activeChannelService.activeChannel.channelID,
      this.message.messageID
    );
  }

  /**
   * Updates a direct message document in the Firestore database with the given
   * message data.
   *
   * @param messageData The partial message data to be used for the update.
   * @param messengerType The type of messenger (either "channels" or "directMessages").
   * @param messengerID The ID of the direct message to which the message belongs.
   * @param messageID The ID of the message document to be updated.
   */
  updateDirectMessage() {
    this.firestoreService.updateMessage(
      { content: this.message.content },
      this.messengerType,
      this.activeDirectMessageService.activeDM.directMessageID,
      this.message.messageID
    );
  }

  /**
   * Updates a thread message document in the Firestore database with the given
   * message data.
   *
   * The thread message belongs to a thread which belongs to a channel.
   * @param messageData The partial message data to be used for the update.
   * @param channelID The ID of the channel to which the thread message belongs.
   * @param messageID The ID of the message to which the thread message belongs.
   * @param threadID The ID of the thread message document to be updated.
   */
  updateThreadMessage() {
    this.firestoreService.updateThreadMessage(
      { content: this.message.content },
      this.activeChannelService.activeChannel.channelID, // channelID
      this.message.messageID, // messageID (übergeordnete Nachricht)
      this.activeThreadService.activeThreadMessage.messageID // threadID
    );
  }

  /**
   * Checks if a given URL is a PDF file.
   *
   * A URL is considered a PDF file if its path ends with '.pdf'.
   * @param url The URL to check.
   * @returns True if the URL is a PDF file, false otherwise.
   */
  isPdf(url: string): boolean {
    const cleanUrl = url.split('?')[0];
    return cleanUrl.toLowerCase().endsWith('.pdf');
  }

  /**
   * Returns a shortened version of the given file name, or the full file name
   * if it is shorter than 20 characters.
   *
   * If the file name is longer than 20 characters, the method returns a
   * substring of the first 20 characters, followed by '...'. This is used
   * in the file preview component to display file names that are too long
   * to fit in the component.
   * @param url The URL of the file to get the shortened file name for.
   * @returns The shortened file name, or the full file name if it is shorter
   * than 20 characters.
   */
  getShortenedFileName(url: string): string {
    const fileName = this.getFileName(url); // Nutze bereits vorhandene Methode, um den Dateinamen zu bekommen
    if (fileName.length > 20) {
      return fileName.substring(0, 20) + '...';
    }
    return fileName;
  }

  /**
   * Returns the file name from a given URL.
   *
   * @param url The URL of the file to get the file name for.
   * @returns The file name of the given URL.
   */
  getFileName(url: string): string {
    return url.substring(url.lastIndexOf('/') + 1);
  }

  /**
   * A trackBy function for the list of attachments. It returns the index of each item.
   *
   * This is necessary because the list of attachments is being sorted and filtered,
   * and Angular needs to know which items are being added, removed, or moved.
   * @param index The index of the item in the array.
   * @param item The item itself.
   * @returns The index of the item.
   */
  trackByIndex(index: number, item: any): number {
    return index;
  }

  /**
   * Lifecycle hook that is called when the component is about to be destroyed.
   *
   * Unsubscribes from the screen size subscription to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.screenSizeSubscription) {
      this.screenSizeSubscription.unsubscribe();
    }
  }
}
