import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doador',
  imports: [],
  templateUrl: './doador.html',
  styleUrl: './doador.css',
})
export class Doador {

  meuPessoaId!: number;
  minhasColetas: any[] = [];
  examesDaColetaAberta: any[] = [];
  coletaAbertaId: number = 0;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {
    const usuarioString = localStorage.getItem('usuarioLogado');

    if (!usuarioString) {
      this.sair();
      return;
    }

    const usuarioLogado = JSON.parse(usuarioString);

    if (usuarioLogado.tipoPerfil !== 'DOADOR') {
      alert("Acesso negado: Esta página é exclusiva para doadores.");
      this.sair();
      return;
    }

    this.meuPessoaId = usuarioLogado.pessoaId;

    if (!this.meuPessoaId) {
      alert("Erro: Este usuário não possui um ID de funcionário vinculado.");
      this.sair();
      return;
    }

    this.buscarMinhasDoacoes();
  }


  sair() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  buscarMinhasDoacoes() {
    this.coletaAbertaId = 0;
    this.examesDaColetaAberta = [];
    this.http.get<any[]>('/api/coleta').subscribe(res => {
      // FILTRO DE SEGURANÇA: O Doador só enxerga as coletas que têm o ID de Pessoa dele!
      this.minhasColetas = res.filter(coleta => coleta.pessoaId === this.meuPessoaId);
      this.cdr.detectChanges();
    });
  }

  verResultados(coletaId: number) {
    if (this.coletaAbertaId === coletaId) {
      this.coletaAbertaId = 0; // Se clicar de novo, ele fecha a sanfona
      return;
    }

    this.coletaAbertaId = coletaId;
    this.http.get<any[]>('/api/exameColeta?coletaId=' + coletaId).subscribe(res => {
      this.examesDaColetaAberta = res;
      this.cdr.detectChanges();
    });
  }
}