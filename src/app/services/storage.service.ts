import { Injectable } from '@angular/core';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';
import { FirebaseApp } from '@angular/fire/app';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: FirebaseStorage;
  private auth: Auth;

  constructor() {
    const app = inject(FirebaseApp);
    this.storage = getStorage(app);
    this.auth = getAuth(app);
  }

  uploadAvatar(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const user = this.auth.currentUser;
      if (user) {
        const storageRef = ref(this.storage, `avatars/${user.uid}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
          (snapshot: any) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          },
          (error: any) => {
            console.error("Upload failed", error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL: string) => {
              resolve(downloadURL);
            }).catch(reject);
          }
        );
      } else {
        reject("No user is signed in.");
      }
    });
  }

  // Neue Methode zum Hochladen von Dateien in einen Channel
  uploadFileToChannel(channelId: string, file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const user = this.auth.currentUser;
      if (user) {
        const storageRef = ref(this.storage, `channels/${channelId}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
          (snapshot: any) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          },
          (error: any) => {
            console.error("Upload failed", error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL: string) => {
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
