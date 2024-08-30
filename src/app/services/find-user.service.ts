import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root',
})
export class FindUserService {
  constructor(private firestoreService: FirestoreService) {}

  findUser(userID: string | null) {
    try {
      let user = this.firestoreService.allUsers.find(
        (users) => users.userID === userID
      );
      return user;
    } catch (err) {
      console.log('no User found: ', err);
      return err;
    }
  }

  findUsers(userIDs: string[] | null) {
    if (!userIDs) return [];

    // Verwende filter(), um alle passenden Nutzer basierend auf den userIDs zu finden
    let users = this.firestoreService.allUsers.filter((user) =>
      userIDs.includes(user.userID)
    );

    return users;
  }

  findUsersWithName(name: string) {
    return this.firestoreService.allUsers.filter((user) =>
      user.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  findUsersWithEmail(email: string) {
    return this.firestoreService.allUsers.filter((user) =>
      user.email.toLowerCase().includes(email.toLowerCase())
    );
  }
}
