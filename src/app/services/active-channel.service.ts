import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class ActiveChannelService {

  activeChannel!: any;

  constructor(private firestoreService: FirestoreService, private firestore: Firestore) { }

  async loadActiveChannel(docID: string) {
    let channel = await getDoc(doc(this.firestore, 'channels', docID));
    this.activeChannel = channel.data();
    console.log(this.activeChannel);

  }
}
