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
   * @param activeDirectMessageService A service that provides the active direct message.
   * @param route The route that led to this component.
   * @param activeUserService A service that provides information about the active user.
   */
  constructor(
    public activeDirectMessageService: ActiveDirectMessageService,
    private route: ActivatedRoute,
    public activeUserService: ActiveUserService
  ) {}

  /**
   * Called when the component is initialized.
   *
   * If the active direct message is not set, it loads it by calling the
   * loadActiveDMAndMessagesAndPartner method of the activeDirectMessageService.
   * This method takes the direct message ID as a parameter, which is obtained from
   * the route parameter map.
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
   * Called when the component is destroyed.
   *
   * Clears the active direct message, unsubscribes from the activeDM and dmMessages observables,
   * and unsubscribes from the activeDMSubscription.
   */
  ngOnDestroy(): void {
    this.activeDirectMessageService.clearActiveDM();
  }
}
