import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { DialogRef } from '@angular/cdk/dialog';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Channel } from '../../models/channel.model';
import { ActiveUserService } from '../../services/active-user.service';
import { FirestoreService } from '../../services/firestore.service';
import { doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-create-channel-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-channel-dialog.component.html',
  styleUrl: './create-channel-dialog.component.scss',
  animations: [
    trigger('dialogAnimationFadeIn', [
      state('void', style({ opacity: 0, transform: 'scale(0.3)' })),
      state('*', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void => *', [
        animate('300ms ease-out')
      ]),
      transition('* => void', [
        animate('200ms ease-in')
      ])
    ]),
  ]
})
export class CreateChannelDialogComponent implements OnInit {

  dialogRef = inject(DialogRef);
  channel!: Channel;
  createdChannel = {
    name: '',
    description:''
  };
  
  mobile: boolean = false;

  constructor(private screenSizeService: ScreenSizeService, private activeUserService: ActiveUserService, private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }


  async onSubmit(form: NgForm) {
    if (form.valid) {
      const newChannel = new Channel();
      newChannel.name = this.createdChannel.name!;
      newChannel.creator = this.activeUserService.activeUser.name;
      newChannel.description = this.createdChannel.description!;
      newChannel.creationTime = Date.now();
      newChannel.member = [this.activeUserService.activeUser.userID];

      try {
        const channelID = await this.firestoreService.addChannel(newChannel);
        
        // Füge den Channel zur Benutzer-Sammlung hinzu
        await this.updateUserWithNewChannel(channelID);
        
        this.dialogRef.close();
      } catch (error) {
        console.error('Fehler beim Erstellen des Channels:', error);
      }
    }
  }

  private async updateUserWithNewChannel(channelID: string) {
    const userID = this.activeUserService.activeUser.userID;
    try {
      await this.firestoreService.updateUser(channelID, userID);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Benutzers:', error);
    }
  }
  
  // onSubmit(form: NgForm) {
  //   if (form.valid) {
  //     let newChannel = new Channel();
  //     newChannel.name = this.createdChannel.name!;
  //     newChannel.creator = this.activeUserService.activeUser.name;
  //     newChannel.description = this.createdChannel.description!;
  //     newChannel.creationTime = Date.now();
  //     newChannel.member = [this.activeUserService.activeUser.userID];
  //     newChannel.channelID = '';

  //     this.firestoreService.addChannel(newChannel).then(() => {
  //       this.dialogRef.close();
  //     });
  //   }
  // }
}
