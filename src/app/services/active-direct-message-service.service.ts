// import { Injectable, OnDestroy } from '@angular/core';
// import { FirestoreService } from './firestore.service';
// import { first, map, Observable, Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
// import { ActiveUserService } from './active-user.service';
// import { FindUserService } from './find-user.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class ActiveDirectMessageService implements OnDestroy {
//   private destroy$ = new Subject<void>(); // Subject to handle unsubscription

//   activeDM: any;
//   activeDMPartner!: any;
//   dmMessages$!: Observable<any[]>;
//   dmMessagesGroupedByDate: any[] = [];

//   constructor(
//     private firestoreService: FirestoreService,
//     private activeUserService: ActiveUserService,
//     private findUserService: FindUserService
//   ) {}

//   async loadActiveDMAndMessagesAndPartner(directMessageID: string) {
//     await this.loadActiveDM(directMessageID);
//     this.loadDMMessages(directMessageID);
//   }

//   async loadActiveDM(directMessageID: string): Promise<void> {
//     this.activeUserService.activeUserDirectMessages$
//       .pipe(
//         first((directMessages) =>
//           directMessages.some(
//             (directMessage) => directMessage.directMessageID === directMessageID
//           )
//         ),
//         map((directMessages) =>
//           directMessages.find(
//             (directMessage) => directMessage.directMessageID === directMessageID
//           )
//         ),
//         takeUntil(this.destroy$) // Ensure unsubscription
//       )
//       .subscribe({
//         next: (directMessage) => {
//           if (directMessage) {
//             this.activeDM = directMessage;

//             if (
//               directMessage.member.length > 1 &&
//               directMessage.directMessageID !=
//                 this.activeUserService.activeUser.userID
//             ) {
//               this.loadActiveDMPartner();
//             } else {
//               this.activeDMPartner = null;
//             }
//           } else {
//             console.error('DirectMessage nicht gefunden');
//           }
//         },
//         error: (error) => {
//           console.error('Fehler beim Laden der aktiven DirectMessage:', error);
//         },
//       });
//   }

//   loadDMMessages(directMessageID: string) {
//     this.dmMessages$ = this.firestoreService.getMessages(
//       'directMessages',
//       directMessageID
//     );
//     this.dmMessages$
//       .pipe(takeUntil(this.destroy$)) // Ensure unsubscription
//       .subscribe({
//         next: (messages) => {
//           let messagesSorted = [];
//           if (messages) {
//             messagesSorted = messages.sort(
//               (a, b) => b.creationTime - a.creationTime
//             );
//             this.groupMessagesByDate(messagesSorted);
//           } else {
//             console.error('Messages nicht gefunden');
//           }
//         },
//         error: (error) => {
//           console.error('Fehler beim Laden der aktiven Messages:', error);
//         },
//       });
//   }

//   groupMessagesByDate(messages: any[]) {
//     const groupedMessages: { [key: string]: any[] } = {};
//     let date: any;

//     messages.forEach((message) => {
//       if (message?.creationTime?.seconds) {
//         date = new Date(
//           message.creationTime.seconds * 1000
//         ).toLocaleDateString(); // Datum aus dem Timestamp extrahieren
//       }

//       if (!groupedMessages[date]) {
//         groupedMessages[date] = [];
//       }
//       groupedMessages[date].push(message); // Nachricht zum richtigen Datum hinzufügen
//     });

//     this.dmMessagesGroupedByDate = Object.keys(groupedMessages).map((date) => ({
//       date,
//       messages: groupedMessages[date],
//     }));
//   }

//   async loadActiveDMPartner() {
//     const partnerUserID = await this.activeDM.member.find(
//       (id: string) => id !== this.activeUserService.activeUser.userID
//     );

//     this.firestoreService.allUsers$
//       .pipe(takeUntil(this.destroy$)) // Ensure unsubscription
//       .subscribe(() => {
//         this.activeDMPartner = this.findUserService.findUser(partnerUserID);
//       });
//   }

//   clearActiveDM() {
//     this.activeDM = null;
//   }

//   ngOnDestroy() {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
// }

import { Injectable, OnDestroy } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { first, map, Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActiveUserService } from './active-user.service';
import { FindUserService } from './find-user.service';

@Injectable({
  providedIn: 'root',
})
export class ActiveDirectMessageService implements OnDestroy {
  private destroy$ = new Subject<void>(); // Subject to handle unsubscription
  private dmMessageSubscription: Subscription | null = null; // Subscription für Direktnachrichten-Nachrichten
  private activeDMSubscription: Subscription | null = null; // Subscription für die aktive Direktnachricht

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
    // Unsubscribe von der vorherigen aktiven DM Subscription (falls vorhanden)
    if (this.activeDMSubscription) {
      this.activeDMSubscription.unsubscribe();
      this.activeDMSubscription = null;
    }

    this.activeDMSubscription = this.activeUserService.activeUserDirectMessages$
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
            // Prüfen, ob es Änderungen gibt
            if (
              this.activeDM &&
              this.activeDM.directMessageID === directMessageID
            ) {
              // Keine Änderungen, nichts tun
              return;
            }

            this.activeDM = directMessage;

            if (
              directMessage.member.length > 1 &&
              directMessage.directMessageID !=
                this.activeUserService.activeUser.userID
            ) {
              this.loadActiveDMPartner();
            } else {
              this.activeDMPartner = null;
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
    // Unsubscribe von der vorherigen Nachrichten-Subscription (falls vorhanden)
    if (this.dmMessageSubscription) {
      this.dmMessageSubscription.unsubscribe();
      this.dmMessageSubscription = null;
    }

    // Nachrichten für die neue Direktnachricht laden
    this.dmMessages$ = this.firestoreService.getMessages(
      'directMessages',
      directMessageID
    );

    this.dmMessageSubscription = this.dmMessages$
      .pipe(takeUntil(this.destroy$)) // Ensure unsubscription
      .subscribe({
        next: (messages) => {
          let messagesSorted = [];
          if (messages) {
            messagesSorted = messages.sort(
              (a, b) => b.creationTime - a.creationTime
            );

            // Überprüfen, ob sich die Nachrichten wirklich geändert haben
            if (
              this.areMessagesSame(messagesSorted, this.dmMessagesGroupedByDate)
            ) {
              // Keine Änderungen, nichts tun
              return;
            }

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

  // Hilfsfunktion, um die Nachrichten zu vergleichen
  areMessagesSame(newMessages: any[], oldMessages: any[]): boolean {
    if (newMessages.length !== oldMessages.length) {
      return false;
    }

    // Prüfen, ob die Nachrichten dieselben IDs haben
    for (let i = 0; i < newMessages.length; i++) {
      if (newMessages[i].messageID !== oldMessages[i].messages[0].messageID) {
        return false;
      }
    }

    return true;
  }

  groupMessagesByDate(messages: any[]) {
    const groupedMessages: { [key: string]: any[] } = {};
    let date: any;

    messages.forEach((message) => {
      if (message?.creationTime?.seconds) {
        date = new Date(
          message.creationTime.seconds * 1000
        ).toLocaleDateString(); // Datum aus dem Timestamp extrahieren
      }

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
      });
  }

  clearActiveDM() {
    // Unsubscribe von den aktuellen Subscriptions
    if (this.activeDMSubscription) {
      this.activeDMSubscription.unsubscribe();
    }
    if (this.dmMessageSubscription) {
      this.dmMessageSubscription.unsubscribe();
    }

    this.activeDM = null;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    // Unsubscribe von den Subscriptions
    if (this.activeDMSubscription) {
      this.activeDMSubscription.unsubscribe();
    }
    if (this.dmMessageSubscription) {
      this.dmMessageSubscription.unsubscribe();
    }
  }
}
