import { Routes } from '@angular/router';
import { MainContentComponent } from './main-content/main-content.component';
import { AuthenticationComponent } from './authentication/authentication.component';

export const routes: Routes = [
    { path: 'main-content', component: MainContentComponent },
    { path: 'authentication', component: AuthenticationComponent }

];
