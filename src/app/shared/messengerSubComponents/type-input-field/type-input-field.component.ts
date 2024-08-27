import { Component, HostListener, Input } from '@angular/core';
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
    CommonModule
  ],
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

  // Methode zum Senden der Nachricht mit den URLs der Anhänge
  sendMessageWithUrls() {
    this.message.creationTime = Date.now();
    this.message.senderID = this.activeUserService.activeUser.userID;
    this.message.senderName = this.activeUserService.activeUser.name;

    // Füge die tatsächlichen URLs zu den Anhängen hinzu
    this.uploadedFiles.forEach(uploadedFile => {
      if (uploadedFile.url) {
        this.message.attachments.push(uploadedFile.url);
      }
    });

    if (this.messengerType === 'thread') {
      this.firestoreService.addThreadMessage(this.message.toJSON(), this.messengerType, this.activeChannelService.activeChannel.channelID);
    } else {
      this.firestoreService.addMessage(this.message.toJSON(), this.messengerType, this.activeChannelService.activeChannel.channelID);
    }

    console.log(this.activeChannelService.activeChannel);
    console.log(this.message);

    this.message.content = '';
  }

  sendMessage(messengerType: string) {
    console.log(this.messengerType);

    // Rufe die Upload-Funktion auf, bevor die Nachricht gesendet wird
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
        // Speichere die Base64-Daten vorübergehend in der `url`-Eigenschaft, um die Vorschau anzuzeigen
        this.uploadedFiles.push({ file, url: reader.result as string });
      };
      reader.readAsDataURL(file);
    });
  }

  // Methode zum Hochladen der Dateien in Firebase Storage und Aktualisierung der URLs
  uploadFileToFirestore() {
    const uploadPromises = this.uploadedFiles.map(uploadedFile => {
      const channelId = this.activeChannelService.activeChannel.channelID;
      return this.storageService.uploadFileToChannel(channelId, uploadedFile.file)
        .then((downloadURL) => {
          console.log('File uploaded successfully:', downloadURL);
          uploadedFile.url = downloadURL; // Speichere die tatsächliche URL
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
          return Promise.reject(error);
        });
    });

    // Warte, bis alle Uploads abgeschlossen sind
    Promise.all(uploadPromises).then(() => {
      this.sendMessageWithUrls(); // Sende die Nachricht nach erfolgreichem Upload
      this.uploadedFiles = []; // Reset der Liste nach dem Hochladen
    }).catch(error => {
      console.error('Error uploading files:', error);
    });
  }

  // Methode zum Entfernen einer Datei aus der Vorschau
  closePreview(fileToRemove: { file: File, url: string }) {
    this.uploadedFiles = this.uploadedFiles.filter(file => file !== fileToRemove);
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    event.preventDefault();
    this.sendMessage(this.messengerType);
  }
}
