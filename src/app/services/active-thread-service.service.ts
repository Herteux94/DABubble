// import { Injectable, OnDestroy } from '@angular/core';
// import { FirestoreService } from './firestore.service';
// import { first, Observable, switchMap, Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
// import { ActiveChannelService } from './active-channel.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class ActiveThreadService implements OnDestroy {
//   private destroy$ = new Subject<void>(); // Used for unsubscribing

//   activeThreadMessage: any;
//   threadMessages$!: Observable<any[]>;
//   threadMessagesGroupedByDate: any[] = [];
//   channelID!: string;

//   constructor(
//     private firestoreService: FirestoreService,
//     private activeChannelService: ActiveChannelService
//   ) {}

//   async loadActiveThreadAndMessages(threadMessageID: string): Promise<void> {
//     if (
//       this.activeChannelService.activeChannel &&
//       this.activeChannelService.activeChannel.channelID
//     ) {
//       this.channelID = this.activeChannelService.activeChannel.channelID;

//       this.activeThreadMessage = (
//         await this.firestoreService.getThread(
//           this.activeChannelService.activeChannel.channelID,
//           threadMessageID
//         )
//       ).data();
//       this.loadThreadMessages(threadMessageID);
//     } else {
//       this.activeChannelService.activeChannel$
//         .pipe(
//           first((channel) => !!channel),
//           switchMap((channel) => {
//             this.channelID = channel!.channelID;
//             return this.firestoreService.getThread(
//               channel!.channelID,
//               threadMessageID
//             );
//           }),
//           takeUntil(this.destroy$) // Ensure unsubscription
//         )
//         .subscribe({
//           next: (activeThread) => {
//             this.activeThreadMessage = activeThread.data();
//             this.loadThreadMessages(threadMessageID);
//           },
//           error: (error) => {
//             console.error('Fehler beim Laden des aktiven Threads:', error);
//           },
//         });
//     }
//   }

//   async loadThreadMessages(threadMessageID: string) {
//     this.threadMessages$ = this.firestoreService.getThreadMessages(
//       this.channelID,
//       threadMessageID
//     );

//     this.threadMessages$
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

//     this.threadMessagesGroupedByDate = Object.keys(groupedMessages).map(
//       (date) => ({
//         date,
//         messages: groupedMessages[date],
//       })
//     );
//   }

//   // Cleanup method to unsubscribe from all observables
//   ngOnDestroy() {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
// }

import { Injectable, OnDestroy } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { first, Observable, Subscription, switchMap, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActiveChannelService } from './active-channel.service';

@Injectable({
  providedIn: 'root',
})
export class ActiveThreadService implements OnDestroy {
  private destroy$ = new Subject<void>(); // Used for unsubscribing
  private threadMessagesSubscription: Subscription | null = null;

  activeThreadMessage: any;
  threadMessages$!: Observable<any[]>;
  threadMessagesGroupedByDate: any[] = [];
  channelID!: string;

  constructor(
    private firestoreService: FirestoreService,
    private activeChannelService: ActiveChannelService
  ) {}

  async loadActiveThreadAndMessages(threadMessageID: string): Promise<void> {
    if (
      this.activeChannelService.activeChannel &&
      this.activeChannelService.activeChannel.channelID
    ) {
      this.channelID = this.activeChannelService.activeChannel.channelID;

      this.activeThreadMessage = (
        await this.firestoreService.getThread(
          this.activeChannelService.activeChannel.channelID,
          threadMessageID
        )
      ).data();
      this.loadThreadMessages(threadMessageID);
    } else {
      this.activeChannelService.activeChannel$
        .pipe(
          first((channel) => !!channel),
          switchMap((channel) => {
            this.channelID = channel!.channelID;
            return this.firestoreService.getThread(
              channel!.channelID,
              threadMessageID
            );
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (activeThread) => {
            this.activeThreadMessage = activeThread.data();
            this.loadThreadMessages(threadMessageID);
          },
          error: (error) => {
            console.error('Fehler beim Laden des aktiven Threads:', error);
          },
        });
    }
  }

  async loadThreadMessages(threadMessageID: string) {
    // Unsubscriben von der vorherigen Subscription (falls vorhanden)
    if (this.threadMessagesSubscription) {
      this.threadMessagesSubscription.unsubscribe();
    }

    this.threadMessages$ = this.firestoreService.getThreadMessages(
      this.channelID,
      threadMessageID
    );

    this.threadMessagesSubscription = this.threadMessages$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messages) => {
          let messagesSorted = [];
          if (messages) {
            messagesSorted = messages.sort(
              (a, b) => a.creationTime - b.creationTime
            );

            // Überprüfen, ob sich die Nachrichten wirklich geändert haben
            if (
              this.areMessagesSame(
                messagesSorted,
                this.threadMessagesGroupedByDate
              )
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

  // Hilfsfunktion zum Vergleich der Nachrichten
  areMessagesSame(newMessages: any[], oldMessages: any[]): boolean {
    if (newMessages.length !== oldMessages.length) {
      return false;
    }

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

    this.threadMessagesGroupedByDate = Object.keys(groupedMessages).map(
      (date) => ({
        date,
        messages: groupedMessages[date],
      })
    );
  }

  // Cleanup method to unsubscribe from all observables
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.threadMessagesSubscription) {
      this.threadMessagesSubscription.unsubscribe();
    }
  }
}
