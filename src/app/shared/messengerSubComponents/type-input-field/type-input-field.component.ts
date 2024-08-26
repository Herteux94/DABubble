import { Component, Input } from '@angular/core';
import { Message } from '../../../models/message.model';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { ActiveUserService } from '../../../services/active-user.service';
import { ActiveChannelService } from '../../../services/active-channel.service';
import { StorageService } from '../../../services/storage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-type-input-field',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule],
  templateUrl: './type-input-field.component.html',
  styleUrls: ['./type-input-field.component.scss']
})
export class TypeInputFieldComponent {

  @Input() messengerType: string = '';
  message = new Message();
  uploadedImageUrl: string = '';  // Variable für die Bild-URL
  fileToUpload: File | null = null;  // Variable, um die ausgewählte Datei zu speichern
  fileToUploadURL: string = '';

  constructor(
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService,
    private activeChannelService: ActiveChannelService,
    private storageService: StorageService
  ) { }

  sendMessage(messengerType: string) {
    console.log(this.messengerType);

    this.message.creationTime = Date.now();
    this.message.senderID = this.activeUserService.activeUser.userID;
    this.message.senderName = this.activeUserService.activeUser.name;
    console.error('fileToUpload:', this.fileToUpload);
    this.message.attachments.push(this.fileToUploadURL);

    if (this.messengerType === 'thread') {
      this.firestoreService.addThreadMessage(this.message.toJSON(), messengerType, this.activeChannelService.activeChannel.channelID);
    } else {
      this.firestoreService.addMessage(this.message.toJSON(), messengerType, this.activeChannelService.activeChannel.channelID);
    }

    console.log(this.activeChannelService.activeChannel.channelID);
    console.log(this.message);

    this.message.content = '';
    this.uploadFileToFirestore();

  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Methode zum Anzeigen der Datei in der Vorschau
  previewFile(event: any) {
    const file: File = event.target.files[0];
    this.fileToUpload = file;
    this.fileToUploadURL = file.name;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedImageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Methode zum Hochladen der Datei in Firestore
  uploadFileToFirestore() {
    if (this.fileToUpload) {
      const channelId = this.activeChannelService.activeChannel.channelID;
      this.storageService.uploadFileToChannel(channelId, this.fileToUpload).then((downloadURL) => {
        console.log('File uploaded successfully:', downloadURL);
        // Weiterverarbeitung des downloadURL falls notwendig
        this.fileToUpload = null;  // Reset der Datei nach dem Hochladen
        this.uploadedImageUrl = '';  // Reset der Vorschau nach dem Hochladen
      }).catch((error) => {
        console.error('Error uploading file:', error);
      });
    } else {
      console.error('No file selected for upload.');
    }
  }

  // Methode zum Schließen der Vorschau
  closePreview() {
    this.uploadedImageUrl = '';  // Entferne die URL aus der Vorschau
    this.fileToUpload = null;  // Setze die Datei-Variable zurück
  }
}
