import { Component, HostListener, Input } from '@angular/core';
import { Message } from '../../../models/message.model';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { ActiveUserService } from '../../../services/active-user.service';
import { ActiveChannelService } from '../../../services/active-channel.service';
import { StorageService } from '../../../services/storage.service';
import { CommonModule } from '@angular/common';
import { ActiveDirectMessageService } from '../../../services/active-direct-message-service.service';
import { ActiveThreadService } from '../../../services/active-thread-service.service';

@Component({
  selector: 'app-type-input-field',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './type-input-field.component.html',
  styleUrls: ['./type-input-field.component.scss'],
})
export class TypeInputFieldComponent {
  @Input() messengerType: string = '';
  message = new Message();
  uploadedFiles: { file: File; url: string }[] = []; // Liste der hochgeladenen Dateien und deren URLs

  constructor(
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService,
    private activeChannelService: ActiveChannelService,
    private storageService: StorageService,
    public activeDirectMessageService: ActiveDirectMessageService,
    private activeThreadService: ActiveThreadService
  ) {}

  // Überprüft den Messenger-Typ und leitet den Upload-Prozess ein
  sendMessage() {
    console.log(this.messengerType);

    if (this.uploadedFiles.length > 0) {
      this.uploadFilesAndSendMessage();
    } else {
      this.sendMessageBasedOnType();
    }
  }

  // Methode zum Hochladen der Dateien und anschließendem Senden der Nachricht
  private uploadFilesAndSendMessage() {
    const uploadPromises = this.uploadedFiles.map((uploadedFile) => {
      return this.uploadFile(uploadedFile);
    });

    Promise.all(uploadPromises)
      .then(() => this.sendMessageBasedOnType())
      .catch((error) => {
        console.error('Error uploading files:', error);
      });
  }

  private uploadFile(uploadedFile: { file: File; url: string }) {
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
        console.log(
          `File uploaded successfully to ${this.messengerType}:`,
          downloadURL
        );
        uploadedFile.url = downloadURL; // Speichere die tatsächliche URL
      })
      .catch((error) => {
        console.error(`Error uploading file to ${this.messengerType}:`, error);
        return Promise.reject(error);
      });
  }

  // Sendet die Nachricht basierend auf dem Messenger-Typ
  private sendMessageBasedOnType() {
    this.prepareMessage();

    if (this.messengerType === 'thread') {
      this.firestoreService.addThreadMessage(
        this.message.toJSON(),
        this.activeChannelService.activeChannel.channelID,
        this.activeThreadService.activeThreadMessage.messageID
      );
    } else if (this.messengerType === 'channels') {
      this.firestoreService.addMessage(
        this.message.toJSON(),
        this.messengerType,
        this.activeChannelService.activeChannel.channelID
      );
    } else if (this.messengerType === 'directMessages') {
      this.firestoreService.addMessage(
        this.message.toJSON(),
        this.messengerType,
        this.activeDirectMessageService.activeDM.directMessageID
      );
    } else {
      console.error('MessengerType not found');
    }

    this.resetMessage();
  }

  private prepareMessage() {
    // Leere die Anhänge der Nachricht, bevor neue hinzugefügt werden
    this.message.attachments = [];

    this.message.creationTime = Date.now();
    this.message.senderID = this.activeUserService.activeUser.userID;
    this.message.senderName = this.activeUserService.activeUser.name;

    // Füge die tatsächlichen URLs zu den Anhängen hinzu
    this.uploadedFiles.forEach((uploadedFile) => {
      if (uploadedFile.url) {
        this.message.attachments.push(uploadedFile.url);
      }
    });
  }

  // Setzt die Nachricht zurück nach dem Senden
  private resetMessage() {
    this.message.content = '';
    this.uploadedFiles = []; // Reset der Liste nach dem Hochladen
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Methode zum Anzeigen der ausgewählten Dateien in der Vorschau
  previewFiles(event: any) {
    const files: File[] = Array.from(event.target.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Speichere die Base64-Daten vorübergehend in der `url`-Eigenschaft, um die Vorschau anzuzeigen
        this.uploadedFiles.push({ file, url: reader.result as string });
      };
      reader.readAsDataURL(file);
    });
  }

  // Methode zum Entfernen einer Datei aus der Vorschau
  closePreview(fileToRemove: { file: File; url: string }) {
    this.uploadedFiles = this.uploadedFiles.filter(
      (file) => file !== fileToRemove
    );
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    event.preventDefault();
    this.sendMessage();
  }
}
