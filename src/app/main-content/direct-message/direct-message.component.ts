import { Component, OnInit } from '@angular/core';
import { DateDividerComponent } from '../../shared/messengerSubComponents/date-divider/date-divider.component';
import { MessageComponent } from '../../shared/messengerSubComponents/message/message.component';
import { SubHeaderComponent } from '../../shared/messengerSubComponents/sub-header/sub-header.component';
import { TypeInputFieldComponent } from '../../shared/messengerSubComponents/type-input-field/type-input-field.component';
import { ActiveDirectMessageService } from '../../services/active-direct-message-service.service';
import { ActivatedRoute } from '@angular/router';
import { ActiveUserService } from '../../services/active-user.service';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [
    DateDividerComponent,
    MessageComponent,
    SubHeaderComponent,
    TypeInputFieldComponent,
  ],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss',
})
export class DirectMessageComponent implements OnInit {
  constructor(
    public activeDirectMessageService: ActiveDirectMessageService,
    private route: ActivatedRoute,
    public activeUserService: ActiveUserService
  ) {}

  ngOnInit() {
    if (!this.activeDirectMessageService.activeDM) {
      let directMessageID: any;
      this.route.paramMap.subscribe((paramMap) => {
        directMessageID = paramMap.get('id');
      });
      this.activeDirectMessageService.loadActiveDMAndMessagesAndPartner(
        directMessageID
      );
    }
  }
}
