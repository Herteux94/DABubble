import { Injectable, OnDestroy } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { first, map, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActiveUserService } from './active-user.service';
import { FindUserService } from './find-user.service';

@Injectable({
  providedIn: 'root',
})
export class ActiveDirectMessageService implements OnDestroy {
  private destroy$ = new Subject<void>(); // Subject to handle unsubscription

  activeDM: any;
  activeDMPartner!: any;
  dmMessages$!: Observable<any[]>;
  dmMessagesGroupedByDate: any[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService,
    private findUserService: FindUserService
  ) {}

  async loadActiveDMAndMessagesAndPartner(directMessageID: string) {
    await this.loadActiveDM(directMessageID);
    this.loadDMMessages(directMessageID);
  }

  async loadActiveDM(directMessageID: string): Promise<void> {
    this.activeUserService.activeUserDirectMessages$
      .pipe(
        first((directMessages) =>
          directMessages.some(
            (directMessage) => directMessage.directMessageID === directMessageID
          )
        ),
        map((directMessages) =>
          directMessages.find(
            (directMessage) => directMessage.directMessageID === directMessageID
          )
        ),
        takeUntil(this.destroy$) // Ensure unsubscription
      )
      .subscribe({
        next: (directMessage) => {
          if (directMessage) {
            this.activeDM = directMessage;

            if (directMessage.member.length > 1) {
              this.loadActiveDMPartner();
              console.log('loadScrtiveDMPartner ohne DM iD ausgeführt');
            } else {
              this.activeDMPartner = null;
              console.log('activeDMPartner genullt');
            }
          } else {
            console.error('DirectMessage nicht gefunden');
          }
        },
        error: (error) => {
          console.error('Fehler beim Laden der aktiven DirectMessage:', error);
        },
      });
  }

  loadDMMessages(directMessageID: string) {
    this.dmMessages$ = this.firestoreService.getMessages(
      'directMessages',
      directMessageID
    );
    this.dmMessages$
      .pipe(takeUntil(this.destroy$)) // Ensure unsubscription
      .subscribe({
        next: (messages) => {
          let messagesSorted = [];
          if (messages) {
            messagesSorted = messages.sort(
              (a, b) => b.creationTime - a.creationTime
            );
            this.groupMessagesByDate(messagesSorted);
          } else {
            console.error('Messages nicht gefunden');
          }
        },
        error: (error) => {
          console.error('Fehler beim Laden der aktiven Messages:', error);
        },
      });
  }

  groupMessagesByDate(messages: any[]) {
    const groupedMessages: { [key: string]: any[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.creationTime).toLocaleDateString(); // Datum aus dem Timestamp extrahieren
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message); // Nachricht zum richtigen Datum hinzufügen
    });

    this.dmMessagesGroupedByDate = Object.keys(groupedMessages).map((date) => ({
      date,
      messages: groupedMessages[date],
    }));
  }

  async loadActiveDMPartner() {
    const partnerUserID = await this.activeDM.member.find(
      (id: string) => id !== this.activeUserService.activeUser.userID
    );

    this.firestoreService.allUsers$
      .pipe(takeUntil(this.destroy$)) // Ensure unsubscription
      .subscribe(() => {
        this.activeDMPartner = this.findUserService.findUser(partnerUserID);
        console.log('loadActiveDMPartner: ', this.activeDMPartner);
      });
  }

  clearActiveDM() {
    this.activeDM = null;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
