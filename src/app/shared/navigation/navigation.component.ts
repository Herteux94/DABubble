import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { CreateChannelDialogComponent } from '../../dialogs/create-channel-dialog/create-channel-dialog.component';
import { Dialog } from '@angular/cdk/dialog';
import { RoutingThreadOutletService } from '../../services/routing-thread-outlet.service';
import { FirestoreService } from '../../services/firestore.service';
import { ActiveChannelService } from '../../services/active-channel.service';
import { ActiveUserService } from '../../services/active-user.service';
import { ActiveDirectMessageService } from '../../services/active-direct-message-service.service';
import { ActualTimestampService } from '../../services/actual-timestamp.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterModule,
    CreateChannelDialogComponent,
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent implements OnInit {
  dialog = inject(Dialog);
  mobile!: boolean;

  constructor(
    public screenSizeService: ScreenSizeService,
    public threadRoutingService: RoutingThreadOutletService,
    public firestoreService: FirestoreService,
    public activeChannelService: ActiveChannelService,
    public activeUserService: ActiveUserService,
    public activeDirectMessageService: ActiveDirectMessageService,
    public actualTimestampService: ActualTimestampService
  ) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

  openNewChannelDialog() {
    this.dialog.open(CreateChannelDialogComponent, {});
  }
}
