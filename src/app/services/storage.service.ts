import { Injectable } from '@angular/core';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';
import { FirebaseApp } from '@angular/fire/app'; // Importiere FirebaseApp
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: FirebaseStorage;
  private auth: Auth;

  constructor() {
    const app = inject(FirebaseApp); // Hole die existierende Firebase-App-Instanz
    this.storage = getStorage(app);  // Initialisiere Firebase Storage mit der App-Instanz
    this.auth = getAuth(app);        // Initialisiere Firebase Auth mit der App-Instanz
  }

  uploadAvatar(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const user = this.auth.currentUser;
      if (user) {
        const storageRef = ref(this.storage, `avatars/${user.uid}/${file.name}`); // Verwende ref korrekt
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
          (snapshot: any) => { // Typ für snapshot hinzufügen
            // Optional: Fortschrittsanzeige
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          },
          (error: any) => { // Typ für error hinzufügen
            // Fehlerbehandlung
            console.error("Upload failed", error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL: string) => { // Typ für downloadURL hinzufügen
              resolve(downloadURL);
            }).catch(reject);
          }
        );
      } else {
        reject("No user is signed in.");
      }
    });
  }
}
