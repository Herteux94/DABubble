import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Hier hinzufügen

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // Importiere provideHttpClient

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(), // Füge provideHttpClient hinzu
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(
      provideFirebaseApp(() =>
        initializeApp({
          projectId: 'dabubble-c9340',
          appId: '1:445784177102:web:69585a0d931dab872e539f',
          storageBucket: 'dabubble-c9340.appspot.com',
          apiKey: 'AIzaSyDk7tAOx6JV7QP6WUjBWQB72E9dwfpCTB4',
          authDomain: 'dabubble-c9340.firebaseapp.com',
          messagingSenderId: '445784177102',
        })
      )
    ),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(provideDatabase(() => getDatabase())),
    importProvidersFrom(provideStorage(() => getStorage())), provideAnimationsAsync(),
  ],
};
