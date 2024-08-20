import { Component } from '@angular/core';
import { Message } from '../../../models/message.model';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { ActiveUserService } from '../../../services/active-user.service';
import { ActiveChannelService } from '../../../services/active-channel.service';

@Component({
  selector: 'app-type-input-field',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './type-input-field.component.html',
  styleUrl: './type-input-field.component.scss'
})
export class TypeInputFieldComponent {

  message = new Message();

  constructor(private firestoreService: FirestoreService, private activeUserService: ActiveUserService, private activeChannelService: ActiveChannelService) { }

  sendMessage() {
    this.message.creationTime = Date.now();
    this.message.messageID = this.generateRandomId();
    this.message.senderID = this.activeUserService.activeUser;
    this.firestoreService.addChannelMessage(this.message.toJSON(), this.activeChannelService.activeChannel.channelID);    
    this.message.content = '';
  }

  generateRandomId(): string {
    return (
        Date.now().toString(36) + // Zeitstempel als Basis
        Math.random().toString(7)
    );
}



}
