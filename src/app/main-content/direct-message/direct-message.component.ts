import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class DirectMessageComponent implements OnInit, OnDestroy {
  /**
   * Constructor for the DirectMessageComponent.
   *
   * @param activeDirectMessageService A service that provides the active direct message and its messages.
   * @param route The current route.
   * @param activeUserService A service that provides the active user.
   */
  constructor(
    public activeDirectMessageService: ActiveDirectMessageService,
    private route: ActivatedRoute,
    public activeUserService: ActiveUserService
  ) {}

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   *
   * If the active direct message is not set, it loads the active direct message and its messages and partner
   * based on the parameter 'id' of the current route.
   */
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

  /**
   * Lifecycle hook that is called when the component is about to be destroyed.
   *
   * Clears the active direct message by calling the clearActiveDM method of the ActiveDirectMessageService.
   */
  ngOnDestroy(): void {
    this.activeDirectMessageService.clearActiveDM();
  }
}
