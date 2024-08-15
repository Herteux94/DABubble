import { Component } from '@angular/core';
import { Message } from '../../../models/message.model';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { ActiveUserService } from '../../../services/active-user.service';

@Component({
  selector: 'app-type-input-field',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './type-input-field.component.html',
  styleUrl: './type-input-field.component.scss'
})
export class TypeInputFieldComponent {

  message = new Message();
  creationTime!: number;
  senderID = this.activeUserService.activeUser;

  constructor(private firestoreService: FirestoreService, private activeUserService: ActiveUserService) { }

  sendMessage() {
    this.creationTime = Date.now();
    this.message.creationTime = this.creationTime;
    this.message.senderID = this.senderID;
    this.firestoreService.addMessage(this.message.toJSON());
    this.message.content = '';
  }



}
