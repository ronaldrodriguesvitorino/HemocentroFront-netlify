import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(private http: HttpClient) {}

  fazerLogin(login: string, senha: string) {
    return this.http.post('http://localhost:8080/auth/login', { login, senha });
  }
}
