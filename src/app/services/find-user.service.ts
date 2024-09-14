import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root',
})
export class FindUserService {
  constructor(private firestoreService: FirestoreService) {}

  /**
   * Finds a user in the allUsers array by userID.
   * Returns the user if found, or the error if not found.
   * @param userID The userID to search for.
   * @returns The user if found, or the error if not found.
   */
  findUser(userID: string | null) {
    try {
      const user = this.firestoreService.allUsers.find(
        (users) => users.userID === userID
      );
      return user;
    } catch (err) {
      console.log('no User found: ', err);
      return err;
    }
  }

  /**
   * Finds multiple users in the allUsers array by userID.
   * Returns an array of the found users if found, or an empty array if not found.
   * @param userIDs The userIDs to search for.
   * @returns An array of users if found, or an empty array if not found.
   */
  findUsers(userIDs: string[] | null) {
    if (!userIDs) return [];
    const users = this.firestoreService.allUsers.filter((user) =>
      userIDs.includes(user.userID)
    );
    return users;
  }

  /**
   * Finds all users in the allUsers array with a name that includes the given name (case insensitive).
   * @param name The name to search for.
   * @returns An array of users with the given name.
   */
  findUsersWithName(name: string) {
    return this.firestoreService.allUsers.filter((user) =>
      user.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  /**
   * Finds all users in the allUsers array with an email that includes the given email (case insensitive).
   * @param email The email to search for.
   * @returns An array of users with the given email.
   */
  findUsersWithEmail(email: string) {
    return this.firestoreService.allUsers.filter((user) =>
      user.email.toLowerCase().includes(email.toLowerCase())
    );
  }
}
