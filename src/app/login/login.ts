import { Component } from '@angular/core';
import { Auth } from '../auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  login: string = '';
  senha: string = '';
  constructor(
    private authService: Auth,
    private router: Router,
  ) {}
  entrar() {
    this.authService.fazerLogin(this.login, this.senha).subscribe({
      next: (resposta: any) => {
        console.log('DEU CERTO, RESPOSTA DO SPRING:', resposta);
        localStorage.setItem('usuarioLogado', JSON.stringify(resposta));
        if (resposta.tipoPerfil === 'GERENTE') {
          this.router.navigate(['/gerente']);
        } else if (resposta.tipoPerfil === 'FUNCIONARIO') {
          this.router.navigate(['/funcionario']);
        } else if (resposta.tipoPerfil === 'USUARIO') {
          this.router.navigate(['/doador']);
        }
      },
      error: (erro) => {
        console.error('ERRO AO LOGAR:', erro);
      },
    });
  }
}
