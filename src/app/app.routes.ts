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
import { ChannelComponent } from './main-content/channel/channel.component';
import { DirectMessageComponent } from './main-content/direct-message/direct-message.component';
import { NewMessageComponent } from './main-content/new-message/new-message.component';
import { ThreadComponent } from './main-content/thread/thread.component';
import { NavigationComponent } from './shared/navigation/navigation.component';
import { HelloComponent } from './main-content/hello/hello.component';

export const routes: Routes = [
    { path: '', component: WorkspaceComponent },
    { path: 'messenger', component: MainContentComponent,
        children: [
            { path: '', redirectTo: 'hello', pathMatch: 'full' },
            { path: 'channel/:id', component: ChannelComponent },
            { path: 'directMessage', component: DirectMessageComponent},
            { path: 'newMessage', component: NewMessageComponent},
            { path: 'threadM', component: ThreadComponent },
            { path: 'thread', component: ThreadComponent, outlet: 'thread' },
            { path: 'navigation', component: NavigationComponent },
            { path: 'hello', component: HelloComponent },
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
