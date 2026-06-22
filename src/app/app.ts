import { Component, signal } from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {Footer} from './footer/footer';
import {Header} from './header/header';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  mostrarMenu : boolean = false;
  constructor(private router: Router){
    this.router.events.subscribe(() => {
      if(this.router.url === '/login' || this.router.url === '/'){
        this.mostrarMenu = false;
      }else{
        this.mostrarMenu = true;
      }
    })
  };
  protected readonly title = signal('HemocentroFront');


}
