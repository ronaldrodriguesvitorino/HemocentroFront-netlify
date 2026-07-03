import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gerente',
  imports: [],
  templateUrl: './gerente.html',
  styleUrl: './gerente.css',
})
export class Gerente {
  meuPessoaId!: number;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {
    const usuarioString = localStorage.getItem('usuarioLogado');

    if (!usuarioString) {
      this.sair();
      return;
    }

    const usuarioLogado = JSON.parse(usuarioString);
    this.meuPessoaId = usuarioLogado.pessoaId;

    if (!this.meuPessoaId) {
      alert("Erro: Este usuário não possui um ID de gerente vinculado.");
      this.sair();
      return;
    }

  }

  sair() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  gerenciarHemocentro() {
    this.router.navigate(['/gerenciarHemocentro']);
  }

  gerenciarExame() {
    this.router.navigate(['/gerenciarExame']);
  }

  gerenciarPessoa() {
    this.router.navigate(['/gerenciarPessoa']);
  }

  gerenciarUsuario() {
    this.router.navigate(['/gerenciarUsuario']);
  }

  gerenciarColeta() {
    this.router.navigate(['/gerenciarColeta']);
  }

  air() {
    localStorage.clear();
    sessionStorage.clear();

    this.router.navigate(['/login']);
  }
}