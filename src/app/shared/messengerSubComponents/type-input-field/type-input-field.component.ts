import { Component, Input } from '@angular/core';
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

  @Input() messengerType: string = '';
  message = new Message();


  constructor(private firestoreService: FirestoreService, private activeUserService: ActiveUserService, private activeChannelService: ActiveChannelService) { }

  sendMessage(messengerType: string) {
    console.log(this.messengerType);
    
    this.message.creationTime = Date.now();
    this.message.senderID = this.activeUserService.activeUser.userID;
    this.message.senderName = this.activeUserService.activeUser.name;

    if(this.messengerType == 'thread') {
      this.firestoreService.addThreadMessage(this.message.toJSON(), messengerType, this.activeChannelService.activeChannel.channelID); //activeThreadID fehlt noch nach ChnannelID
    } else{
      this.firestoreService.addMessage(this.message.toJSON(), messengerType, this.activeChannelService.activeChannel.channelID);    
    }

    console.log(this.activeChannelService.activeChannel.channelID);
    
    console.log(this.message);
    

    this.message.content = '';
  }



}
