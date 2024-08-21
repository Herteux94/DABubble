import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, DocumentSnapshot } from '@angular/fire/firestore';
import { FirestoreService } from './firestore.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ActiveUserService {

  activeUser!: User;
  activeUserChannels = [];

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
          this.loadUserChannels(this.activeUser.channels);
          this.loadUserMessages();
        }
      } else {
        console.error('Benutzer nicht gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Laden des aktiven Benutzers:', error);
    }
  }

  // Beispielmethode zum Laden der Channels des aktiven Benutzers
  private loadUserChannels(activeUserChannelsIDs: any[]) {
    this.firestoreService.allChannels$.subscribe((channels) => {
      if (channels && channels.length > 0) {
        // Filtert die Channels, deren IDs in activeUserChannelsIDs enthalten sind
        const activeUserChannels = channels.filter((channel: any) => 
          activeUserChannelsIDs.includes(channel.channelID)
        );
  
        // Hier kannst du dann das Ergebnis (activeUserChannels) weiterverarbeiten
        console.log(activeUserChannels);
      }
    });
  }

  // Beispielmethode zum Laden der Nachrichten des aktiven Benutzers
  private loadUserMessages() {
    if (this.activeUser && this.activeUser.directMessages) {
      console.log('Benutzernachrichten laden:', this.activeUser.directMessages);
      // Weitere Logik hier
    }
  }
}
