import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, DocumentSnapshot } from '@angular/fire/firestore';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class ActiveUserService {

  activeUser: any;

  constructor(
    private firestore: Firestore,
    private firestoreService: FirestoreService,
  ) {}

  // Methode zum Laden des aktiven Benutzers mit activeUserID
  async loadActiveUser(activeUserID: string) {
    console.log('Lade aktiven Benutzer mit activeUserID:', activeUserID); // Debugging

    try {
      const userRef = doc(this.firestore, `users/${activeUserID}`);
      const userSnap: DocumentSnapshot = await getDoc(userRef);

      if (userSnap.exists()) {
        this.activeUser = userSnap.data();
        console.log('Aktiver Benutzer geladen:', this.activeUser);

        // Weitere Logik, z.B. das Laden von Channels und Nachrichten
        this.loadUserChannels();
        this.loadUserMessages();
      } else {
        console.error('Benutzer nicht gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Laden des aktiven Benutzers:', error);
    }
  }

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
