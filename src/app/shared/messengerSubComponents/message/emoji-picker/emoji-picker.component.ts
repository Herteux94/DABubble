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
  @Output() emojiSelect = new EventEmitter<{ emoji: string; userID: string }>();

  constructor(
    private activeUserService: ActiveUserService,
  ) {}

  addEmoji(event: any) {
    const selectedEmoji = event.emoji.native;
    const userID = this.activeUserService.activeUser?.userID;

    if (userID) {
      this.emojiSelect.emit({ emoji: selectedEmoji, userID });
    } else {
      console.error('No active user found.');
    }
  }
}
