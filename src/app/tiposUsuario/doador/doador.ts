import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doador',
  imports: [],
  templateUrl: './doador.html',
  styleUrl: './doador.css', // MESMO CSS
})
export class Doador {
  
  // No mundo real, isso viria do Login: Number(localStorage.getItem('pessoaId'))
  // Deixei o ID 3 (Gabriel Bortoleto) fixo para você conseguir testar a filtragem agora!
  meuPessoaId: number = 3; 
  
  minhasColetas: any[] = [];
  examesDaColetaAberta: any[] = [];
  coletaAbertaId: number = 0;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {
    this.buscarMinhasDoacoes();
  }

  sair() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  buscarMinhasDoacoes() {
    this.http.get<any[]>('http://localhost:8080/coleta').subscribe(res => {
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
    this.http.get<any[]>('http://localhost:8080/exameColeta?coletaId=' + coletaId).subscribe(res => {
      this.examesDaColetaAberta = res;
      this.cdr.detectChanges();
    });
  }
}