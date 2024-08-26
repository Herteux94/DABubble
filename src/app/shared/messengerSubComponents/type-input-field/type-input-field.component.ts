import { Component, Input } from '@angular/core';
import { Message } from '../../../models/message.model';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { ActiveUserService } from '../../../services/active-user.service';
import { ActiveChannelService } from '../../../services/active-channel.service';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'app-type-input-field',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './type-input-field.component.html',
  styleUrls: ['./type-input-field.component.scss']
})
export class TypeInputFieldComponent {

  @Input() messengerType: string = '';
  message = new Message();

  constructor(
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService,
    private activeChannelService: ActiveChannelService,
    private storageService: StorageService // StorageService injizieren
  ) {}

  sendMessage(messengerType: string) {
    console.log(this.messengerType);

    this.message.creationTime = Date.now();
    this.message.senderID = this.activeUserService.activeUser.userID;
    this.message.senderName = this.activeUserService.activeUser.name;

    if(this.messengerType === 'thread') {
      this.firestoreService.addThreadMessage(this.message.toJSON(), messengerType, this.activeChannelService.activeChannel.channelID);
    } else {
      this.firestoreService.addMessage(this.message.toJSON(), messengerType, this.activeChannelService.activeChannel.channelID);
    }

    console.log(this.activeChannelService.activeChannel.channelID);
    console.log(this.message);

    this.message.content = '';
  }

  // Methode, um das versteckte Dateieingabefeld zu triggern
  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Methode zum Upload von Dateien in den Channel
  uploadFile(event: any) {
    const file: File = event.target.files[0];
    const channelId = this.activeChannelService.activeChannel.channelID;

    if (file) {
      this.storageService.uploadFileToChannel(channelId, file).then((downloadURL) => {
        console.log('File uploaded successfully:', downloadURL);
        // Weiterverarbeitung des downloadURL falls notwendig
      }).catch((error) => {
        console.error('Error uploading file:', error);
      });
    }
  }
}
