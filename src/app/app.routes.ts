import { Routes } from '@angular/router';
import { MainContentComponent } from './main-content/main-content.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { DialogTestComponent } from './dialog-test/dialog-test.component';
import { LoginComponent } from './authentication/login/login.component';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { ChooseAvatarComponent } from './authentication/choose-avatar/choose-avatar.component';
import { SendResetPwMailComponent } from './authentication/send-reset-pw-mail/send-reset-pw-mail.component';
import { ResetPwComponent } from './authentication/reset-pw/reset-pw.component';
import { MessengerComponent } from './main-content/messenger/messenger.component';

export const routes: Routes = [
    { path: '', component: WorkspaceComponent },
    { path: 'main-content', component: MainContentComponent,
        children: [
            { path: 'messenger', component: MessengerComponent},
        ]
    },
    { path: 'authentication', component: AuthenticationComponent,
        children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },  // Redirect to login
            { path: 'login', component: LoginComponent },  // Explicit login route
            { path: 'signUp', component: SignUpComponent },
            { path: 'createAccount', component: ChooseAvatarComponent },
            { path: 'sendResetPWMail', component: SendResetPwMailComponent },
            { path: 'resetPW', component: ResetPwComponent },
        ]
    },
    { path: 'dialogs', component: DialogTestComponent },
];
