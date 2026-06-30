import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  
  constructor(private router: Router) {}

  sair(): void {
    localStorage.clear();
    sessionStorage.clear();

    this.router.navigate(['/login']);
  }
}