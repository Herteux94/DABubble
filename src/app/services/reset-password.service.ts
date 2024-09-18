import { Injectable } from '@angular/core';
import {
  getAuth,
  sendPasswordResetEmail,
  confirmPasswordReset,
} from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class ResetPasswordService {
  private auth = getAuth();

  constructor() {}

  /**
   * Sends a password reset email to the given email address.
   *
   * Tries to send a password reset email to the given email address. If the email
   * is sent successfully, it logs a success message. If an error occurs, it logs the
   * error and re-throws it.
   * @param email The email address to which the password reset email should be sent.
   * @returns A promise that resolves if the email was sent successfully, or rejects
   * if an error occurs.
   */
  sendPasswordResetEmail(email: string): Promise<void> {
    const actionCodeSettings = {
      url: 'https://herteux-webentwicklung.de/resetPassword',
      handleCodeInApp: true,
    };

    return sendPasswordResetEmail(this.auth, email, actionCodeSettings)
      .then(() => {
      })
      .catch((error) => {
        console.error('Fehler beim Versenden der Email zur Passwortrücksetzung', error);
        throw error;
      });
  }

  /**
   * Resets the user's password using the given one-time password code and new
   * password.
   *
   * Tries to reset the user's password using the given one-time password code and
   * new password. If the password is reset successfully, it logs a success message.
   * If an error occurs, it logs the error and re-throws it.
   * @param oobCode The one-time password code from the password reset email.
   * @param newPassword The new password that the user wants to use.
   * @returns A promise that resolves if the password was reset successfully, or
   * rejects if an error occurs.
   */
  confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
    return confirmPasswordReset(this.auth, oobCode, newPassword)
      .then(() => {
      })
      .catch((error) => {
        console.error('Fehler beim Passwort zurücksetzen', error);
        throw error;
      });
  }
}
