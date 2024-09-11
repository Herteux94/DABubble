import {
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  ViewChild
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

  errorMessageUpload: string = ''; // Variable für die Fehlermeldungen

  @ViewChild('messageInput') messageInput!: ElementRef; // Referenz zum Textarea

  constructor(
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService,
    private activeChannelService: ActiveChannelService,
    private storageService: StorageService,
    public activeDirectMessageService: ActiveDirectMessageService,
    private activeThreadService: ActiveThreadService,
    private router: Router,
    private el: ElementRef
  ) { }

  sendMessage() {
    if (this.uploadedFiles.length > 0) {
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

  private async sendMessageBasedOnType() {
    this.prepareMessage();

    try {
      if (this.messengerType === 'thread') {
        const activeThreadMessage =
          this.activeThreadService.activeThreadMessage;
        const channelID = this.activeChannelService.activeChannel.channelID;

        // Füge die Nachricht zum Thread hinzu
        await this.firestoreService.addThreadMessage(
          this.message.toJSON(),
          channelID,
          activeThreadMessage.messageID
        );

        // Aktualisiere die ursprüngliche Nachricht, zu der der Thread gehört
        const updatedThreadLength = (activeThreadMessage.threadLength || 0) + 1; // Falls threadLength undefined ist, setze es auf 0
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

        // Update local activeThreadMessage to reflect the new threadLength
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
      this.errorMessageUpload = 'Error sending message. Please try again.'; // Fehlernachricht speichern
    } finally {
      this.resetMessage();
    }
  }

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

  private resetMessage() {
    this.message.content = '';
    this.uploadedFiles = []; // Reset der Liste nach dem Hochladen
  }

  // Methode zum Hochladen der Dateien und anschließendem Senden der Nachricht
  private uploadFilesAndSendMessage() {
    const uploadPromises = this.uploadedFiles.map((uploadedFile) => {
      return this.uploadFile(uploadedFile);
    });
    Promise.all(uploadPromises)
      .then(() => {
        this.errorMessageUpload = ''; // Fehler zurücksetzen, wenn der Upload erfolgreich ist
        this.sendMessageBasedOnType();
      })
      .catch((error) => {
        console.error('Error uploading files:', error);
        this.errorMessageUpload = error; // Fehlernachricht speichern
      });
  }

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

  private performUpload(
    uploadMethod: (id: string, file: File) => Promise<string>,
    id: string,
    uploadedFile: { file: File; url: string }
  ) {
    return uploadMethod
      .call(this.storageService, id, uploadedFile.file)
      .then((downloadURL) => {
        uploadedFile.url = downloadURL; // Speichere die tatsächliche URL
      })
      .catch((error) => {
        console.error(`Error uploading file to ${this.messengerType}:`, error);
        return Promise.reject(error);
      });
  }

  previewFiles(event: any) {
    const files: File[] = Array.from(event.target.files);
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    files.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        const errorMessage = `Ungültiger Dateityp:${file.name} - Es sind nur jpg-, jpeg-, png- und pdf-Dateien erlaubt.`;
        console.error(errorMessage);
        this.errorMessageUpload = errorMessage; // Fehlernachricht speichern
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedFiles.push({ file, url: reader.result as string });
      };
      reader.readAsDataURL(file);
    });
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  closePreview(fileToRemove: { file: File; url: string }) {
    this.uploadedFiles = this.uploadedFiles.filter(
      (file) => file !== fileToRemove
    );
  }

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

  addEmoji(event: { emoji: string }) {
    const emoji = event.emoji;
    const inputElement = this.messageInput.nativeElement;

    // Füge das Emoji an der aktuellen Cursor-Position in message.content ein
    const startPos = inputElement.selectionStart;
    const endPos = inputElement.selectionEnd;

    // message.content wird modifiziert, um das Emoji hinzuzufügen
    this.message.content = this.message.content.slice(0, startPos) + emoji + this.message.content.slice(endPos);

    // Den Emoji-Picker schließen
    this.showEmojiPicker = false;

    // Setze den Fokus zurück auf das Textarea und aktualisiere die Cursor-Position
    setTimeout(() => {
      inputElement.focus();
      inputElement.selectionStart = startPos + emoji.length;
      inputElement.selectionEnd = startPos + emoji.length;
    }, 0);
  }



  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    const activeElement = document.activeElement;
    if (this.el.nativeElement.contains(activeElement)) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
