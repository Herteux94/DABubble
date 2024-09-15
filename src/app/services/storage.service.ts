import { Injectable } from '@angular/core';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';
import { FirebaseApp } from '@angular/fire/app';
import { inject } from '@angular/core';
import { deleteObject, listAll } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  public storage: FirebaseStorage;
  private auth: Auth;

  constructor() {
    const app = inject(FirebaseApp);
    this.storage = getStorage(app);
    this.auth = getAuth(app);
  }

  // **Hilfsfunktion zur Überprüfung der Dateigröße**
  private checkFileSize(file: File, maxSizeInMB: number): void {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // Konvertiere MB in Bytes
    if (file.size > maxSizeInBytes) {
      throw new Error(`Die Dateigröße überschreitet das Limit von ${maxSizeInMB} MB.`);
    }
  }

  uploadAvatar(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Erlaubte Dateitypen
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

      // Überprüfe den Dateityp
      if (!allowedTypes.includes(file.type)) {
        reject('Ungültiger Dateityp. Nur jpg, jpeg, png und pdf Dateien sind erlaubt.');
        return;
      }

      // **Überprüfe die Dateigröße mit der Hilfsfunktion**
      try {
        this.checkFileSize(file, 1); // 1 MB Limit
      } catch (error: any) {
        reject(error.message);
        return;
      }

      const user = this.auth.currentUser;
      if (user) {
        const storageRef = ref(this.storage, `avatars/${user.uid}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
          (snapshot: any) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload ist ' + progress + '% abgeschlossen');
          },
          (error: any) => {
            console.error("Upload fehlgeschlagen", error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL: string) => {
              resolve(downloadURL);
            }).catch(reject);
          }
        );
      } else {
        reject("Kein Benutzer ist angemeldet.");
      }
    });
  }

  async deleteOldAvatars(excludeUrl: string): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      const userAvatarFolderRef = ref(this.storage, `avatars/${user.uid}`);
      const allFiles = await listAll(userAvatarFolderRef);

      for (const fileRef of allFiles.items) {
        const fileUrl = await getDownloadURL(fileRef);
        if (fileUrl !== excludeUrl) {
          await deleteObject(fileRef);
        }
      }
    } else {
      return Promise.reject("Kein Benutzer ist angemeldet.");
    }
  }

  // Methode zum Hochladen von Dateien in einen Channel
  uploadFileToChannel(channelId: string, file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // **Überprüfe die Dateigröße mit der Hilfsfunktion**
      try {
        this.checkFileSize(file, 1); // 1 MB Limit
      } catch (error: any) {
        reject(error.message);
        return;
      }

      const user = this.auth.currentUser;
      if (user) {
        const storageRef = ref(this.storage, `channels/${channelId}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
          (snapshot: any) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload ist ' + progress + '% abgeschlossen');
          },
          (error: any) => {
            console.error("Upload fehlgeschlagen", error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL: string) => {
              resolve(downloadURL);
            }).catch(reject);
          }
        );
      } else {
        reject("Kein Benutzer ist angemeldet.");
      }
    });
  }

  // Methode zum Hochladen von Dateien in eine Direktnachricht
  uploadFileToDirectMessage(conversationId: string, file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // **Überprüfe die Dateigröße mit der Hilfsfunktion**
      try {
        this.checkFileSize(file, 1); // 1 MB Limit
      } catch (error: any) {
        reject(error.message);
        return;
      }

      const user = this.auth.currentUser;
      if (user) {
        const storageRef = ref(this.storage, `direct_messages/${conversationId}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
          (snapshot: any) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload ist ' + progress + '% abgeschlossen');
          },
          (error: any) => {
            console.error("Upload fehlgeschlagen", error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL: string) => {
              resolve(downloadURL);
            }).catch(reject);
          }
        );
      } else {
        reject("Kein Benutzer ist angemeldet.");
      }
    });
  }
}
