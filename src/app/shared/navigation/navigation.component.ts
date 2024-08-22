import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { CreateChannelDialogComponent } from '../../dialogs/create-channel-dialog/create-channel-dialog.component';
import { Dialog, DIALOG_DATA, DialogModule } from '@angular/cdk/dialog';
import { RoutingThreadOutletService } from '../../services/routing-thread-outlet.service';
import { FirestoreService } from '../../services/firestore.service';
import { ActiveChannelService } from '../../services/active-channel.service';
import { ActiveUserService } from '../../services/active-user.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule, CreateChannelDialogComponent],
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
    private router: Router,
    public activeChannelService: ActiveChannelService,
    public activeUserService: ActiveUserService
  ) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

  openNewChannelDialog() {
    this.dialog.open(CreateChannelDialogComponent, {
      // minWidth: '300px',
      // data: {
      //   animal: 'panda',
      // },
    });
  }

  
}
