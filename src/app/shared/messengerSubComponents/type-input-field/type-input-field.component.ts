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

  constructor(private firestoreService: FirestoreService, private activeUserService: ActiveUserService) { }

  sendMessage() {
  //   this.message.creationTime = Date.now();
  //   this.message.senderID = this.activeUserService.activeUser;
  //   this.firestoreService.addMessage(this.message.toJSON());
  //   // this.firestoreService.pushMessageToChannel('VfidlPx9GWzscN0zrgFv', 'bdgCJJieGfDDi4Jc0bSt');
  //   this.message.content = '';
  }



}
