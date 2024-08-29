import { Component, OnInit } from '@angular/core';
import { SubHeaderComponent } from '../../shared/messengerSubComponents/sub-header/sub-header.component';
import { MessageComponent } from '../../shared/messengerSubComponents/message/message.component';
import { TypeInputFieldComponent } from '../../shared/messengerSubComponents/type-input-field/type-input-field.component';
import { ActiveChannelService } from '../../services/active-channel.service';
import { ActiveThreadService } from '../../services/active-thread-service.service';
import { ActivatedRoute } from '@angular/router';
import { ActiveUserService } from '../../services/active-user.service';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [SubHeaderComponent, MessageComponent, TypeInputFieldComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent implements OnInit {
  constructor(
    public activeChannelService: ActiveChannelService,
    public activeThreadService: ActiveThreadService,
    public activeUserService: ActiveUserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    if (!this.activeThreadService.activeThreadMessage) {
      let threadID: any;
      this.route.paramMap.subscribe((paramMap) => {
        threadID = paramMap.get('id');
      });
      this.activeThreadService.loadActiveThreadAndMessages(threadID);
    }
  }
}
