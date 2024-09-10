import { Injectable, OnDestroy } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { first, map, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Message } from '../models/message.model';
import { ActiveUserService } from './active-user.service';
import { FindUserService } from './find-user.service';

@Injectable({
  providedIn: 'root',
})
export class ActiveDirectMessageService implements OnDestroy {
  private destroy$ = new Subject<void>(); // Subject to handle unsubscription

  activeDM: any;
  dmMessages$!: Observable<any[]>;
  dmMessages: Message[] = [];

  activeDMPartner!: any;

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
            this.loadActiveDMPartner();
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
          if (messages) {
            this.dmMessages = messages.sort(
              (a, b) => b.creationTime - a.creationTime
            );
          } else {
            console.error('Messages nicht gefunden');
          }
        },
        error: (error) => {
          console.error('Fehler beim Laden der aktiven Messages:', error);
        },
      });
  }

  async loadActiveDMPartner() {
    const partnerUserID = await this.activeDM.member.find(
      (id: string) => id !== this.activeUserService.activeUser.userID
    );

    this.firestoreService.allUsers$
      .pipe(takeUntil(this.destroy$)) // Ensure unsubscription
      .subscribe(() => {
        this.activeDMPartner = this.findUserService.findUser(partnerUserID);
      });
  }

  clearActiveDM() {
    this.activeDM = null;
  }

  // Cleanup method to unsubscribe from all observables
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
