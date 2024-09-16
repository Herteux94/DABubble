import { Component, OnInit } from '@angular/core';
import { SubHeaderComponent } from '../../shared/messengerSubComponents/sub-header/sub-header.component';
import { MessageComponent } from '../../shared/messengerSubComponents/message/message.component';
import { TypeInputFieldComponent } from '../../shared/messengerSubComponents/type-input-field/type-input-field.component';
import { ActiveChannelService } from '../../services/active-channel.service';
import { ActiveThreadService } from '../../services/active-thread-service.service';
import { ActivatedRoute } from '@angular/router';
import { ActiveUserService } from '../../services/active-user.service';
import { RoutingThreadOutletService } from '../../services/routing-thread-outlet.service';
import { DateDividerComponent } from '../../shared/messengerSubComponents/date-divider/date-divider.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    SubHeaderComponent,
    MessageComponent,
    TypeInputFieldComponent,
    DateDividerComponent,
  ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent implements OnInit {
  /**
   * Constructor for the ThreadComponent.
   *
   * @param activeChannelService Injected service to get the active channel.
   * @param activeThreadService Injected service to get the active thread.
   * @param activeUserService Injected service to get the active user.
   * @param threadRoutingService Injected service to navigate to the thread view.
   * @param route Injected service to get the active route.
   */
  constructor(
    public activeChannelService: ActiveChannelService,
    public activeThreadService: ActiveThreadService,
    public activeUserService: ActiveUserService,
    private threadRoutingService: RoutingThreadOutletService,
    private route: ActivatedRoute
  ) {}

  /**
   * Lifecycle hook that is called after the component's view has been initialized.
   *
   * If the active thread message is not set, it loads the active thread message
   * and its messages by calling the loadActiveThreadAndMessages method.
   * Additionally, it sets the threadOpenDesktop flag to true.
   */
  ngOnInit() {
    if (!this.activeThreadService.activeThreadMessage) {
      let threadID: any;
      this.route.paramMap.subscribe((paramMap) => {
        threadID = paramMap.get('id');
      });

      setTimeout(() => {
        this.threadRoutingService.threadOpenDesktop = true; // if-Abfrage wegen doppelter Animation
        this.activeThreadService.loadActiveThreadAndMessages(threadID);
      }, 0); // Delay für die nächste Change Detection
    }
  }
}
