import { Routes } from '@angular/router';
import { MainContentComponent } from './main-content/main-content.component';
import { AuthenticationComponent } from './authentication/authentication.component';
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
import { PrivacyComponent } from './legal/privacy/privacy.component';
import { ImprintComponent } from './legal/imprint/imprint.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AuthenticationComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'signUp', component: SignUpComponent },
      { path: 'createAccount', component: ChooseAvatarComponent },
      { path: 'sendResetPWMail', component: SendResetPwMailComponent },
      { path: 'resetPassword', component: ResetPwComponent },
    ],
  },
  {
    path: 'messenger',
    component: MainContentComponent,
    data: { animation: 'routerTransitions' },
    children: [
      { path: '', redirectTo: 'hello', pathMatch: 'full' },
      { path: 'channel/:id', component: ChannelComponent },
      { path: 'directMessage/:id', component: DirectMessageComponent },
      { path: 'newMessage', component: NewMessageComponent },
      { path: 'channel/:id/threadM/:id', component: ThreadComponent },
      { path: 'thread/:id', component: ThreadComponent, outlet: 'thread' },
      { path: 'navigation', component: NavigationComponent },
      { path: 'hello', component: HelloComponent },
    ],
  },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'imprint', component: ImprintComponent },
  { path: '**', redirectTo: 'login' },
];
