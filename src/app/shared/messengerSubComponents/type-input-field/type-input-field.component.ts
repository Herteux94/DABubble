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
  uploadedFiles: { file: File, url: string }[] = [];  // Liste der hochgeladenen Dateien und deren URLs

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

    this.uploadedFiles.forEach(uploadedFile => {
      this.message.attachments.push(uploadedFile.url);
    });

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

  // Methode zum Anzeigen der ausgewählten Dateien in der Vorschau
  previewFiles(event: any) {
    const files: File[] = Array.from(event.target.files);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedFiles.push({ file, url: reader.result as string });
      };
      reader.readAsDataURL(file);
    });
  }

  // Methode zum Hochladen der Dateien in Firestore
  uploadFileToFirestore() {
    this.uploadedFiles.forEach(uploadedFile => {
      const channelId = this.activeChannelService.activeChannel.channelID;
      this.storageService.uploadFileToChannel(channelId, uploadedFile.file).then((downloadURL) => {
        console.log('File uploaded successfully:', downloadURL);
        // Aktualisiere die URL nach dem Hochladen, falls notwendig
        uploadedFile.url = downloadURL;
      }).catch((error) => {
        console.error('Error uploading file:', error);
      });
    });

    this.uploadedFiles = [];  // Reset der Liste nach dem Hochladen
  }

  // Methode zum Entfernen einer Datei aus der Vorschau
  closePreview(fileToRemove: { file: File, url: string }) {
    this.uploadedFiles = this.uploadedFiles.filter(file => file !== fileToRemove);
  }
}
