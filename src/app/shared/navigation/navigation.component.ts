import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { CreateChannelDialogComponent } from '../../dialogs/create-channel-dialog/create-channel-dialog.component';
import { Dialog, DIALOG_DATA, DialogModule } from '@angular/cdk/dialog';
import { RoutingThreadOutletService } from '../../services/routing-thread-outlet.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { FirestoreService } from '../../services/firestore.service';
import { ActiveChannelService } from '../../services/active-channel.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule, CreateChannelDialogComponent],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  // animations: [
  //   trigger('fadeAnimation', [
  //     transition(':enter', [
  //       style({ opacity: 0, transform: 'translateY(-100%)' }),
  //       animate('700ms ease-in', style({ opacity: 1, transform: 'translateY(0)' })),
  //     ]),
  //   ]),
  // ],
})
export class NavigationComponent implements OnInit {
  dialog = inject(Dialog);

  mobile!: boolean;

  constructor(
    public screenSizeService: ScreenSizeService,
    public threadRoutingService: RoutingThreadOutletService,
    public firestoreService: FirestoreService,
    public activeChannelService: ActiveChannelService
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
