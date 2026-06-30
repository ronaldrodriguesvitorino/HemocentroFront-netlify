import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gerente',
  imports: [],
  templateUrl: './gerente.html',
  styleUrl: './gerente.css',
})
export class Gerente {
  constructor(private router: Router){};

  gerenciarHemocentro(){
    this.router.navigate(['/gerenciarHemocentro']);
  }
  
  gerenciarExame(){
    this.router.navigate(['/gerenciarExame']);
  }
  
  gerenciarPessoa(){
    this.router.navigate(['/gerenciarPessoa']);
  }
  
  gerenciarUsuario(){
    this.router.navigate(['/gerenciarUsuario']);
  }
  
  gerenciarColeta(){
    this.router.navigate(['/gerenciarColeta']);
  }

  air() {
    localStorage.clear(); 
    sessionStorage.clear(); 

    this.router.navigate(['/login']); 
  }
}