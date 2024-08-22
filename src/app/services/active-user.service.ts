import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  DocumentSnapshot,
} from '@angular/fire/firestore';
import { FirestoreService } from './firestore.service';
import { User } from '../models/user.model';
import { Channel } from '../models/channel.model';
import { DirectMessage } from '../models/directMessages.model';
import { user } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class ActiveUserService {
  activeUser!: any;
  activeUserChannels!: Channel[];
  activeUserDirectMessages!: DirectMessage[];

  constructor(
    private firestore: Firestore,
    private firestoreService: FirestoreService
  ) {}

  // async loadActiveUser(activeUserID: string) {
  //   console.log('Lade aktiven Benutzer mit activeUserID:', activeUserID); // Debugging

  //   try {
  //     const userRef = doc(this.firestore, `users/${activeUserID}`);
  //     const userSnap: DocumentSnapshot = await getDoc(userRef);

  //     if (userSnap.exists()) {
  //       const userData = userSnap.data();
  //       if (userData) {
  //         // Erstellt eine Instanz des User-Modells und überträgt die Daten
  //         this.activeUser = Object.assign(new User(), userData);

  //         console.log('Aktiver Benutzer geladen:', this.activeUser);

  //         // Weitere Logik, z.B. das Laden von Channels und Nachrichten
  //         this.loadUserChannels(this.activeUser.channels);
  //         this.loadUserDirectMessages(this.activeUser.directMessages);
  //       }
  //     } else {
  //       console.error('Benutzer nicht gefunden');
  //     }
  //   } catch (error) {
  //     console.error('Fehler beim Laden des aktiven Benutzers:', error);
  //   }
  // }

  async loadActiveUser() {
    const userID = this.getActiveUserFromLocalStorage();

    this.firestoreService.allUsers$.subscribe((users) => {
      if (users.length > 0) {
        this.activeUser = this.firestoreService.allUsers.find(
          (user: any) => user.userID == userID
        );
      }
    });

    this.loadUserChannels(this.activeUser.channels);
    this.loadUserDirectMessages(this.activeUser.directMessages);

    console.log(this.activeUser);
    console.log(this.activeUserChannels);
    console.log(this.activeUserDirectMessages);
  }

  setActiveUserToLocalStorage(userID: string) {
    localStorage.setItem('activeUser', userID);
  }

  getActiveUserFromLocalStorage() {
    const userID = localStorage.getItem('activeUser');
    return userID?.toString();
  }

  private loadUserChannels(activeUserChannelIDs: any[]) {
    this.firestoreService.allChannels$.subscribe((channels) => {
      if (channels && channels.length > 0) {
        this.activeUserChannels = channels.filter((channel: any) =>
          activeUserChannelIDs.includes(channel.channelID)
        );

        console.log(this.activeUserChannels);
      }
    });
  }

  private loadUserDirectMessages(activeUserDirectMessageIDs: any[]) {
    this.firestoreService.allChannels$.subscribe((directMessages) => {
      if (directMessages && directMessages.length > 0) {
        this.activeUserDirectMessages = directMessages.filter((channel: any) =>
          activeUserDirectMessageIDs.includes(channel.channelID)
        );

        console.log(this.activeUserDirectMessages);
      }
    });
  }
}
