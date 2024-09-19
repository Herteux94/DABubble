import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);

const originalConsoleLog = console.log;
console.log = function (...args) {
  const logMessage = args.join(' ');
  // Filtere Heartbeat oder unerwünschte Logs
  if (
    !logMessage.includes('heartbeat') &&
    !logMessage.includes('Angular is running') &&
    !logMessage.includes('The resource')
  ) {
    originalConsoleLog.apply(console, args);
  }
};

