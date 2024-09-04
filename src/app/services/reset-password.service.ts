import { Injectable } from '@angular/core';
import { getAuth, sendPasswordResetEmail, confirmPasswordReset } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {
  private auth = getAuth();

  constructor() {}

  // E-Mail zum Zurücksetzen des Passworts versenden
  sendPasswordResetEmail(email: string): Promise<void> {
    const actionCodeSettings = {
      url: 'https://herteux-webentwicklung.de/resetPassword', // Eigene Seite zum Zurücksetzen des Passworts
      handleCodeInApp: true // Ermöglicht es, den Link in der App zu handhaben
    };

    return sendPasswordResetEmail(this.auth, email, actionCodeSettings)
      .then(() => {
        console.log('Password reset email sent successfully');
      })
      .catch((error) => {
        console.error('Error sending password reset email', error);
        throw error;
      });
  }

  // Passwort mithilfe des oobCode zurücksetzen
  confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
    return confirmPasswordReset(this.auth, oobCode, newPassword)
      .then(() => {
        console.log('Password has been reset successfully');
      })
      .catch((error) => {
        console.error('Error resetting password', error);
        throw error;
      });
  }
}
