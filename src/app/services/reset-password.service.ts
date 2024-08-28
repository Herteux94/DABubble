
import { Injectable } from '@angular/core';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {
  private auth = getAuth();

  constructor() {}

  resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email)
      .then(() => {
        console.log('Password reset email sent successfully');
      })
      .catch((error) => {
        console.error('Error sending password reset email', error);
        throw error;
      });
  }
}


// import { Injectable } from '@angular/core';
// import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

// @Injectable({
//   providedIn: 'root'
// })
// export class ResetPasswordService {
//   private auth = getAuth();

//   constructor() {}

//   resetPassword(email: string): Promise<void> {
//     const actionCodeSettings = {
//       url: 'https://dabubble-c9340.firebaseapp.com/resetPassword', // Diese URL verweist auf deine eigene Passwort-Reset-Seite
//       handleCodeInApp: true
//     };

//     return sendPasswordResetEmail(this.auth, email, actionCodeSettings)
//       .then(() => {
//         console.log('Password reset email sent successfully');
//       })
//       .catch((error) => {
//         console.error('Error sending password reset email', error);
//         throw error;
//       });
//   }
// }
