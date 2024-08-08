import { Routes } from '@angular/router';
import { MainContentComponent } from './main-content/main-content.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { WorkspaceComponent } from './workspace/workspace.component';

export const routes: Routes = [
    { path: '', component: WorkspaceComponent },
    { path: 'main-content', component: MainContentComponent },
    { path: 'authentication', component: AuthenticationComponent }

];
