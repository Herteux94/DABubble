import { Component, OnInit } from '@angular/core';
import { DateDividerComponent } from '../../shared/messengerSubComponents/date-divider/date-divider.component';
import { MessageComponent } from '../../shared/messengerSubComponents/message/message.component';
import { OwnMessageComponent } from '../../shared/messengerSubComponents/own-message/own-message.component';
import { SubHeaderComponent } from '../../shared/messengerSubComponents/sub-header/sub-header.component';
import { TypeInputFieldComponent } from '../../shared/messengerSubComponents/type-input-field/type-input-field.component';
import { ThreadComponent } from '../thread/thread.component';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';


@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [DateDividerComponent, MessageComponent, OwnMessageComponent, SubHeaderComponent, TypeInputFieldComponent, ThreadComponent],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent implements OnInit {

  activeChannel!: any;
  memberList!: any;
  messages!: any;

  constructor(private route: ActivatedRoute, private firestoreService: FirestoreService) {}

  async ngOnInit() {
    await this.loadActiveChannel();
    this.loadMemberList();
    this.loadMessages()
  }
  
  // loadActiveChannel() {
  //   this.route.paramMap.subscribe((paramMap) => {
  //     const activeChannelID = paramMap.get('id');
  //     if (activeChannelID) {
  //           let channel = this.firestoreService.allChannels.find((channel: any) => channel.channelID == activeChannelID);
  //           this.activeChannel = channel;
  //     }
  //   });
  // }

  // loadMemberList() {
  //   this.activeChannel.member.forEach((member: any) => {
  //     this.memberList.push(member);
  //   });
  //   console.log(this.memberList);
    
  // }

  loadActiveChannel(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.route.paramMap.subscribe((paramMap) => {
        const activeChannelID = paramMap.get('id');
        if (activeChannelID) {
          setTimeout(() => {
            let channel = this.firestoreService.allChannels.find((channel: any) => channel.channelID == activeChannelID);
            this.activeChannel = channel;
            resolve();  // Promise wird aufgelöst, sobald der Kanal gesetzt wurde

          }, 1000)
        } else {
          reject('No channel ID found');
        }
      });
    });
  }

  loadMemberList() {
    if (this.activeChannel && this.activeChannel.member) {
      this.memberList = this.activeChannel.member.map((member: any) => member);
      console.log(this.memberList);
    } else {
      console.error('Active channel or members not found');
    }
  }

  loadMessages() {
    if (this.activeChannel && this.activeChannel.messages) {
      this.messages = this.activeChannel.messages.map((message: any) => message);
      console.log(this.messages);
    } else {
      console.error('Active channel or messages not found');
    }
  }

  }




