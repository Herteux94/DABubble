import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResetPasswordService {
  private resetPasswordUrl = 'https://herteux-webentwicklung.de/reset-password.php';

  constructor(private http: HttpClient) {
    console.log('ResetPasswordService wurde instanziiert');
  }

  sendResetPasswordEmail(email: string): Observable<any> {
    console.log('Sende E-Mail-Adresse:', email);

    const headers = { 'Content-Type': 'application/json' }; // Setze Content-Type Header explizit
    const body = { email };

    return this.http.post<any>(this.resetPasswordUrl, body, { headers });
  }
}
