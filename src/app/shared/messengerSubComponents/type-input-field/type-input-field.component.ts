import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  Input,
  signal,
  ViewChild,
} from '@angular/core';
import { Message } from '../../../models/message.model';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { ActiveUserService } from '../../../services/active-user.service';
import { ActiveChannelService } from '../../../services/active-channel.service';
import { StorageService } from '../../../services/storage.service';
import { CommonModule } from '@angular/common';
import { ActiveDirectMessageService } from '../../../services/active-direct-message-service.service';
import { ActiveThreadService } from '../../../services/active-thread-service.service';
import { NewDirectMessageService } from '../../../services/new-direct-message.service';
import { Router } from '@angular/router';
import { serverTimestamp } from '@angular/fire/firestore';
import { EmojiPickerComponent } from '../message/emoji-picker/emoji-picker.component';
import { User } from '../../../models/user.model';
import { FindUserService } from '../../../services/find-user.service';

@Component({
  selector: 'app-type-input-field',
  standalone: true,
  imports: [FormsModule, CommonModule, EmojiPickerComponent],
  templateUrl: './type-input-field.component.html',
  styleUrls: ['./type-input-field.component.scss'],
})
export class TypeInputFieldComponent {
  @Input() messengerType: string = '';
  @Input() newDirectMessage: boolean = false;
  newDirectMessageService = inject(NewDirectMessageService);
  message = new Message();
  showEmojiPicker: boolean = false; // Flag zum Anzeigen des Emoji-Pickers
  uploadedFiles: { file: File; url: string }[] = []; // Liste der hochgeladenen Dateien und deren URLs
  showError = false;
  errorMessageUpload: string = ''; // Variable für die Fehlermeldungen

  searchQuery = signal('');
  firstLetter = signal('');

  foundUsers = computed(() => {
    if (this.firstLetter() === '@') {
      const searchQuery = this.searchQuery().substring(1).toLowerCase();
      return this.activeChannelService.channelMember.filter(member => 
        member.name.toLowerCase().includes(searchQuery)
      );
    }
    return [];
  });

  @ViewChild('messageInput') messageInput!: ElementRef; // Referenz zum Textarea
  @ViewChild('emojiPicker') emojiPicker!: ElementRef; // Referenz zum Emoji-Picker

  /**
   * Constructor for the TypeInputFieldComponent.
   *
   * @param firestoreService An instance of the FirestoreService, used to interact with Firestore.
   * @param activeUserService An instance of the ActiveUserService, used to get the active user.
   * @param activeChannelService An instance of the ActiveChannelService, used to get the active channel.
   * @param storageService An instance of the StorageService, used to upload files.
   * @param activeDirectMessageService An instance of the ActiveDirectMessageService, used to get the active direct message.
   * @param activeThreadService An instance of the ActiveThreadService, used to get the active thread.
   * @param router An instance of the Router, used to navigate to a thread.
   * @param el The ElementRef of the component, used to get the element.
   */
  constructor(
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService,
    private activeChannelService: ActiveChannelService,
    private storageService: StorageService,
    public activeDirectMessageService: ActiveDirectMessageService,
    private activeThreadService: ActiveThreadService,
    private router: Router,
    private el: ElementRef,
  ) {}


  /**
   * Updates the search query signal with the current value of the
   * input field, whenever the user types something in the input field.
   * If the input starts with '@', it sets the firstLetter signal to '@'.
   * @param event The input event from the input field.
   */
  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;

    this.searchQuery.set(inputValue);

    if (inputValue.startsWith('@')) {
      this.firstLetter.set('@');
    }
  }

  /**
   * Selects a user to mention in the message.
   * Sets the search query to the user's name preceded by '@'.
   * @param user The user to select.
   */
  selectUser(user: User): void {
      this.searchQuery.set(`@${user.name} `);
      this.focusTextarea();
  }

  /**
   * Sets the focus to the text area after a short delay.
   * This is necessary because the focus method is called after the DOM is updated.
   * Without the delay, the focus would not be set.
   */
  private focusTextarea(): void {
    setTimeout(() => {
      this.messageInput.nativeElement.focus();
    }, 0);  // Verwende setTimeout, um sicherzustellen, dass der Fokus nach dem DOM-Update gesetzt wird
  }

  /**
   * Sends a message to the Firestore database based on the messenger type.
   *
   * @remarks
   * If the message contains text and/or files, it will be sent to the Firestore database.
   * If no text or file is provided, an error message will be displayed.
   * After sending the message, it will update the user's last online timestamp.
   */
  sendMessage() {
    const hasText = this.message.content.trim().length > 0;
    const hasFiles = this.uploadedFiles.length > 0;

    if (!hasText && !hasFiles) {
      this.errorMessageUpload =
        'Bitte geben Sie eine Nachricht ein oder fügen Sie eine Datei hinzu.';
      return;
    }

    if (hasFiles) {
      this.uploadFilesAndSendMessage();
    } else {
      this.sendMessageBasedOnType();
    }

    if (this.activeUserService.activeUser?.userID) {
      this.firestoreService.updateUser(
        { lastOnline: Date.now() },
        this.activeUserService.activeUser.userID
      );
    }
  }


  /**
   * Sends a message to the Firestore database based on the messenger type.
   *
   * @remarks
   * If the message contains text and/or files, it will be sent to the Firestore database.
   * If no text or file is provided, an error message will be displayed.
   * After sending the message, it will update the user's last online timestamp.
   *
   * @throws {Error} If the message could not be sent to the Firestore database.
   */
  private async sendMessageBasedOnType() {
    this.prepareMessage();

    try {
      if (this.messengerType === 'thread') {
        const activeThreadMessage =
          this.activeThreadService.activeThreadMessage;
        const channelID = this.activeChannelService.activeChannel.channelID;

        await this.firestoreService.addThreadMessage(
          this.message.toJSON(),
          channelID,
          activeThreadMessage.messageID
        );

        const updatedThreadLength = (activeThreadMessage.threadLength || 0) + 1;
        const messagePayload = {
          lastAnswer: this.message.creationTime,
          threadLength: updatedThreadLength,
        };

        await this.firestoreService.updateMessage(
          messagePayload,
          'channels',
          channelID,
          activeThreadMessage.messageID
        );

        this.activeThreadService.activeThreadMessage.threadLength =
          updatedThreadLength;
      } else if (this.messengerType === 'channels') {
        await this.firestoreService.addMessage(
          this.message.toJSON(),
          this.messengerType,
          this.activeChannelService.activeChannel.channelID
        );
      } else if (
        this.messengerType === 'directMessages' &&
        !this.newDirectMessage
      ) {
        await this.firestoreService.addMessage(
          this.message.toJSON(),
          this.messengerType,
          this.activeDirectMessageService.activeDM.directMessageID
        );
      } else if (
        this.messengerType === 'directMessages' &&
        this.newDirectMessage
      ) {
        const directMessageID =
          await this.newDirectMessageService.addNewDirectMessage();
        await this.activeDirectMessageService.loadActiveDMAndMessagesAndPartner(
          directMessageID
        );
        await this.firestoreService.addMessage(
          this.message.toJSON(),
          this.messengerType,
          directMessageID
        );

        this.router.navigate([`messenger/directMessage/${directMessageID}`]);
      } else {
        console.error('MessengerType not found');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.errorMessageUpload = 'Error sending message. Please try again.';
    } finally {
      this.resetMessage();
    }
  }

  /**
   * Prepares the message to be sent by resetting the attachments array and
   * setting the creation time and the sender ID.
   *
   * It also loops over the uploaded files and adds their URLs to the
   * attachments array.
   */
  //
  private prepareMessage() {
    this.message.attachments = [];
    this.message.creationTime = serverTimestamp();
    this.message.senderID = this.activeUserService.activeUser.userID;

    this.uploadedFiles.forEach((uploadedFile) => {
      if (uploadedFile.url) {
        this.message.attachments.push(uploadedFile.url);
      }
    });
  }

  /**
   * Resets the message content and uploaded files to their initial state.
   * Called after sending a message.
   */
  private resetMessage() {
    this.message.content = '';
    this.uploadedFiles = [];
  }

  /**
   * Uploads all the files in the uploadedFiles array and sends a message after
   * all files have been uploaded. If any of the uploads fail, an error message
   * is displayed and the message is not sent.
   *
   * @remarks
   * This function is called when the user clicks the "Send" button and there
   * are files to be uploaded. It loops over the uploaded files and calls
   * {@link uploadFile} for each file. If all uploads are successful, it then
   * calls {@link sendMessageBasedOnType} to send the message. If any of the
   * uploads fail, it displays an error message and does not send the message.
   */
  private uploadFilesAndSendMessage() {
    const uploadPromises = this.uploadedFiles.map((uploadedFile) => {
      return this.uploadFile(uploadedFile);
    });
    Promise.all(uploadPromises)
      .then(() => {
        this.errorMessageUpload = '';
        this.sendMessageBasedOnType();
      })
      .catch((error) => {
        console.error('Error uploading files:', error);
        this.errorMessageUpload = error;
      });
  }

  /**
   * Uploads a single file to the Firestore storage and returns a promise that
   * resolves with the download URL of the uploaded file.
   *
   * @remarks
   * This function is called by {@link uploadFilesAndSendMessage} for each file
   * in the `uploadedFiles` array. It first checks if the file is of an allowed
   * type (jpg, jpeg, png, pdf). If not, it rejects the promise with an error
   * message. Then it calls {@link getUploadMethod} to get the upload method
   * based on the `messengerType`. If the upload method is not supported, it
   * rejects the promise with an error message. Finally, it calls
   * {@link performUpload} to upload the file and returns the promise returned
   * by {@link performUpload}.
   *
   * @param uploadedFile The file to be uploaded.
   * @returns A promise that resolves with the download URL of the uploaded file.
   */
  private uploadFile(uploadedFile: { file: File; url: string }) {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (!allowedTypes.includes(uploadedFile.file.type)) {
      return Promise.reject(
        'Ungültiger Dateityp. Es sind nur jpg-, jpeg-, png- und pdf-Dateien erlaubt.'
      );
    }

    const uploadMethod = this.getUploadMethod();
    const id = this.getIdForUpload();

    if (uploadMethod && id) {
      return this.performUpload(uploadMethod, id, uploadedFile);
    } else {
      return Promise.reject('Unknown or unsupported message type');
    }
  }

  /**
   * Returns the upload method based on the `messengerType`.
   *
   * @returns A function that takes three arguments: `id`, `file`, and `metadata`.
   *          The function returns a promise that resolves with the download URL
   *          of the uploaded file.
   */
  private getUploadMethod() {
    if (this.messengerType === 'channels') {
      return this.storageService.uploadFileToChannel;
    } else if (this.messengerType === 'directMessages') {
      return this.storageService.uploadFileToDirectMessage;
    } else {
      console.error('Unknown message type:', this.messengerType);
      return null;
    }
  }

  /**
   * Returns the ID of the channel or direct message where the file is being
   * uploaded to, based on the value of `messengerType`.
   *
   * @returns The ID of the channel or direct message, or null if the
   *          `messengerType` is unknown or unsupported.
   */
  private getIdForUpload() {
    if (this.messengerType === 'channels') {
      return this.activeChannelService.activeChannel.channelID;
    } else if (this.messengerType === 'directMessages') {
      return this.activeDirectMessageService.activeDM.directMessageID;
    } else {
      console.error('Unknown message type:', this.messengerType);
      return null;
    }
  }

  /**
   * Uploads a single file to the Firestore storage and returns a promise that
   * resolves with the download URL of the uploaded file.
   *
   * @param uploadMethod A function that takes three arguments: `id`, `file`, and
   *                     `metadata`. The function returns a promise that resolves
   *                     with the download URL of the uploaded file.
   * @param id The ID of the channel or direct message where the file is being
   *           uploaded to, based on the value of `messengerType`.
   * @param uploadedFile The file to be uploaded, along with its URL.
   *
   * @returns A promise that resolves with the download URL of the uploaded file,
   *          or rejects with an error message if the upload fails.
   */
  private performUpload(
    uploadMethod: (id: string, file: File) => Promise<string>,
    id: string,
    uploadedFile: { file: File; url: string }
  ) {
    return uploadMethod
      .call(this.storageService, id, uploadedFile.file)
      .then((downloadURL) => {
        uploadedFile.url = downloadURL;
      })
      .catch((error) => {
        console.error(`Error uploading file to ${this.messengerType}:`, error);
        return Promise.reject(error);
      });
  }

  /**
   * Preview files that are selected by the user. The method first checks if the
   * selected files are of the allowed types (jpg, jpeg, png, pdf). If not, it
   * displays an error message and doesn't add the file to the list of uploaded
   * files. If the file is a pdf, it uses a static image for the preview. For all
   * other files, it reads the file as a data URL and adds it to the list of
   * uploaded files.
   *
   * @param event The event that is triggered when the user selects files to
   *              upload.
   */
  previewFiles(event: any) {
    const files: File[] = Array.from(event.target.files);
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    files.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        const errorMessage = `Ungültiger Dateityp:${file.name} - Es sind nur jpg-, jpeg-, png- und pdf-Dateien erlaubt.`;
        console.error(errorMessage);
        this.errorMessageUpload = errorMessage;
        return;
      }

      if (file.type === 'application/pdf') {
        // Verwende statisches Bild für PDFs
        this.uploadedFiles.push({ file, url: 'assets/img/pdf-icon.png' });
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          this.uploadedFiles.push({ file, url: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  /**
   * Checks if a given file is a PDF file.
   *
   * A file is considered a PDF file if its type is 'application/pdf'.
   * @param file The file to check.
   * @returns True if the file is a PDF file, false otherwise.
   */
  isPdf(file: { file: File; url: string }): boolean {
    return file.file.type === 'application/pdf';
  }

  /**
   * Triggers the click event on the file input element.
   *
   * This function is called when the user clicks on the "Add file" button.
   * It triggers the click event on the file input element, which allows the
   * user to select a file to upload.
   */
  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  /**
   * Removes a given file from the list of uploaded files.
   *
   * This function is called when the user clicks on the "X" button next to
   * a file preview.
   * @param fileToRemove The file to remove from the list of uploaded files.
   */
  closePreview(fileToRemove: { file: File; url: string }) {
    this.uploadedFiles = this.uploadedFiles.filter(
      (file) => file !== fileToRemove
    );
  }

  /**
   * Returns the placeholder text for the text input field, based on the
   * current messenger type.
   *
   * If the messenger type is 'channels', the placeholder text is
   * 'Nachricht an #<channel name>...'. If the messenger type is
   * 'directMessages', the placeholder text is 'Nachricht an <partner name>...'.
   * If the messenger type is 'thread', the placeholder text is 'Antworten...'.
   * Otherwise, the placeholder text is 'Schreibe eine Nachricht...'.
   * @returns The placeholder text for the text input field.
   */
  getPlaceholder() {
    switch (this.messengerType) {
      case 'channels': {
        let channelName = '';
        if (this.activeChannelService?.activeChannel?.name) {
          channelName = this.activeChannelService.activeChannel.name;
        }
        return 'Nachricht an #' + channelName + '...';
      }
      case 'directMessages': {
        let dmPartnerName = '';
        if (this.activeDirectMessageService?.activeDMPartner?.name) {
          dmPartnerName = this.activeDirectMessageService.activeDMPartner.name;
        }
        return 'Nachricht an ' + dmPartnerName + '...';
      }
      case 'thread':
        return 'Antworten...';
      default:
        return 'Schreibe eine Nachricht...';
    }
  }

  /**
   * Handles emoji selection and adds the selected emoji to the message content
   * at the current cursor position.
   *
   * The emoji is inserted at the current selection start position, and the
   * selection is then moved to the end of the inserted emoji.
   *
   * @param event The event containing the selected emoji.
   */

  addEmoji(event: { emoji: string }) {
    const emoji = event.emoji;
    const inputElement = this.messageInput.nativeElement;

    const startPos = inputElement.selectionStart;
    const endPos = inputElement.selectionEnd;

    this.message.content =
      this.message.content.slice(0, startPos) +
      emoji +
      this.message.content.slice(endPos);

    this.showEmojiPicker = false;

    setTimeout(() => {
      inputElement.focus();
      inputElement.selectionStart = startPos + emoji.length;
      inputElement.selectionEnd = startPos + emoji.length;
    }, 0);
  }

  /**
   * Toggles the emoji picker.
   * If the emoji picker is currently shown, it will be hidden.
   * If the emoji picker is currently hidden, it will be shown.
   */
  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  @HostListener('document:keydown.enter', ['$event'])
  /**
   * Handles the enter key being pressed when the user is inside this component.
   *
   * Prevents the default behavior of the enter key and calls the `sendMessage`
   * method to send the message if the user is currently inside this component.
   * @param event The KeyboardEvent that triggered this function.
   */
  handleEnterKey(event: KeyboardEvent) {
    const activeElement = document.activeElement;
    if (this.el.nativeElement.contains(activeElement)) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  @HostListener('document:click', ['$event'])
  /**
   * Handles a click outside of the emoji picker.
   *
   * If the emoji picker is currently shown and the user clicks outside of it
   * (i.e., not on the emoji picker button nor inside the emoji picker), this
   * function will hide the emoji picker.
   * @param event The MouseEvent that triggered this function.
   */
  clickOutside(event: MouseEvent) {
    const clickedInsideEmojiButton = (event.target as HTMLElement).closest(
      '#emojiPicker'
    );
    const clickedInsideEmojiPicker = this.emojiPicker?.nativeElement.contains(
      event.target
    );

    if (
      this.showEmojiPicker &&
      !clickedInsideEmojiButton &&
      !clickedInsideEmojiPicker
    ) {
      this.showEmojiPicker = false;
    }
  }
}
