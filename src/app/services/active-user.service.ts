import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, DocumentSnapshot } from '@angular/fire/firestore';
import { FirestoreService } from './firestore.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ActiveUserService {

  activeUser!: User;

  constructor(
    private firestore: Firestore,
    private firestoreService: FirestoreService,
  ) {}


  async loadActiveUser(activeUserID: string) {
    console.log('Lade aktiven Benutzer mit activeUserID:', activeUserID); // Debugging

    try {
      const userRef = doc(this.firestore, `users/${activeUserID}`);
      const userSnap: DocumentSnapshot = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData) {
          // Erstellt eine Instanz des User-Modells und überträgt die Daten
          this.activeUser = Object.assign(new User(), userData);

          console.log('Aktiver Benutzer geladen:', this.activeUser);

          // Weitere Logik, z.B. das Laden von Channels und Nachrichten
          this.loadUserChannels();
          this.loadUserMessages();
        }
      } else {
        console.error('Benutzer nicht gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Laden des aktiven Benutzers:', error);
    }
  }





  // async loadActiveUser(activeUserID: string) {
  //   console.log('Lade aktiven Benutzer mit activeUserID:', activeUserID); // Debugging

  //   try {
  //     const userRef = doc(this.firestore, `users/${activeUserID}`);
  //     const userSnap: DocumentSnapshot = await getDoc(userRef);

  //     if (userSnap.exists()) {
  //       const userData = userSnap.data();
  //       if (userData) {
  //         this.activeUser = new User(); // Erstelle eine Instanz des User-Modells

  //         // Weist die Eigenschaften des Firestore-Dokuments der User-Instanz zu
  //         this.activeUser.name = userData['name'] || '';
  //         this.activeUser.profileImg = userData['profileImg'] || '';
  //         this.activeUser.email = userData['email'] || '';
  //         this.activeUser.active = userData['active'] || false;
  //         this.activeUser.lastOnline = userData['lastOnline'] || '';
  //         this.activeUser.passwordResetToken = userData['passwordResetToken'] || '';
  //         this.activeUser.passwordResetExpires = userData['passwordResetExpires'] || '';
  //         this.activeUser.channels = userData['channels'] || [];
  //         this.activeUser.directMessages = userData['directMessages'] || [];

  //         console.log('Aktiver Benutzer geladen:', this.activeUser);

  //         // Weitere Logik, z.B. das Laden von Channels und Nachrichten
  //         this.loadUserChannels();
  //         // this.loadUserMessages();     //Wird zu direct Messages
  //       }
  //     } else {
  //       console.error('Benutzer nicht gefunden');
  //     }
  //   } catch (error) {
  //     console.error('Fehler beim Laden des aktiven Benutzers:', error);
  //   }
  // }

  // Methode zum Laden des aktiven Benutzers mit activeUserID
  // async loadActiveUser(activeUserID: string) {
  //   console.log('Lade aktiven Benutzer mit activeUserID:', activeUserID); // Debugging

  //   try {
  //     const userRef = doc(this.firestore, `users/${activeUserID}`);
  //     const userSnap: DocumentSnapshot = await getDoc(userRef);

  //     if (userSnap.exists()) {
  //       this.activeUser = userSnap.data();
  //       console.log('Aktiver Benutzer geladen:', this.activeUser);

  //       // Weitere Logik, z.B. das Laden von Channels und Nachrichten
  //       this.loadUserChannels();
  //       this.loadUserMessages();
  //     } else {
  //       console.error('Benutzer nicht gefunden');
  //     }
  //   } catch (error) {
  //     console.error('Fehler beim Laden des aktiven Benutzers:', error);
  //   }
  // }

  // Beispielmethode zum Laden der Channels des aktiven Benutzers
  private loadUserChannels() {
    if (this.activeUser && this.activeUser.channels) {
      console.log('Benutzerkanäle laden:', this.activeUser.channels);
      // Weitere Logik hier
    }
  }

  // Beispielmethode zum Laden der Nachrichten des aktiven Benutzers
  private loadUserMessages() {
    if (this.activeUser && this.activeUser.directMessages) {
      console.log('Benutzernachrichten laden:', this.activeUser.directMessages);
      // Weitere Logik hier
    }
  }
}
