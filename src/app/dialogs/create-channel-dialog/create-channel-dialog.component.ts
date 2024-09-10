import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { DialogRef } from '@angular/cdk/dialog';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Channel } from '../../models/channel.model';
import { ActiveUserService } from '../../services/active-user.service';
import { FirestoreService } from '../../services/firestore.service';
import { FormsModule, NgForm } from '@angular/forms';
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
  @ViewChild('contactForm') contactForm!: NgForm;
  mobile: boolean = false;

  constructor(private el: ElementRef, private screenSizeService: ScreenSizeService, private activeUserService: ActiveUserService, private firestoreService: FirestoreService) {}
 
  ngOnInit() {
    this.screenSizeService.isMobile().subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }

  async onSubmit() {
    if (this.contactForm.valid) {
      const newChannel = new Channel();
      newChannel.name = this.createdChannel.name!;
      newChannel.creator = this.activeUserService.activeUser.name;
      newChannel.description = this.createdChannel.description!;
      newChannel.creationTime = Date.now();
      newChannel.member = [this.activeUserService.activeUser.userID];

      try {
        await this.firestoreService.addChannel(newChannel.toJSON(), this.activeUserService.activeUser.userID);
        console.log('channel: ', newChannel);
        console.log('active User: ', this.activeUserService.activeUser.userID);
        this.dialogRef.close();
      } catch (error) {
        console.error('Fehler beim Erstellen des Channels:', error);
      }
    } else {
      console.log('Formular ist ungültig, wird nicht gesendet.');
    }
  }

  

  // async onSubmit(form: NgForm) {
  //   if (form.valid) {
  //     const newChannel = new Channel();
  //     newChannel.name = this.createdChannel.name!;
  //     newChannel.creator = this.activeUserService.activeUser.name;
  //     newChannel.description = this.createdChannel.description!;
  //     newChannel.creationTime = Date.now();
  //     newChannel.member = [this.activeUserService.activeUser.userID];

  //     try {
  //       this.firestoreService.addChannel(newChannel.toJSON(), this.activeUserService.activeUser.userID);

  //       setTimeout(() => {
  //         console.log('channel: ', newChannel);
  //         console.log('active User: ', this.activeUserService.activeUser.userID);
          
  //       },1000)

        
  //       this.dialogRef.close();
  //     } catch (error) {
  //       console.error('Fehler beim Erstellen des Channels:', error);
  //     }
  //   }
  // }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    const activeElement = document.activeElement;
    if (this.el.nativeElement.contains(activeElement)) {
      event.preventDefault();
      this.onSubmit();
    }
  }
}
