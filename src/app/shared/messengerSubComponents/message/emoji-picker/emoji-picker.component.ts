import { ActiveUserService } from './../../../../services/active-user.service';
import { Component, EventEmitter, Output } from '@angular/core';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [PickerModule],
  templateUrl: './emoji-picker.component.html',
  styleUrls: ['./emoji-picker.component.scss'],
})
export class EmojiPickerComponent {
  // Hier klarstellen, dass wir ein Objekt mit 'emoji' und 'userID' erwarten
  @Output() emojiSelect = new EventEmitter<{ emoji: string; userID: string }>();

  constructor(private activeUserService: ActiveUserService) {}

  addEmoji(event: any) {
    const selectedEmoji = event.emoji.native; // Das ausgewählte Emoji
    const userID = this.activeUserService.activeUser?.userID; // User-ID des aktuellen Nutzers

    if (userID) {
      // Emitte ein Objekt mit 'emoji' und 'userID'
      this.emojiSelect.emit({ emoji: selectedEmoji, userID });
    } else {
      console.error('No active user found.');
    }
  }

}
