import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exame',
  imports: [FormsModule],
  templateUrl: './exame.html',
  styleUrl: './exame.css',
})
export class Exame {
  abaAtual: string = 'listar';
  
  listaExames: any[] = [];
  idBusca!: number;
  busca: any;

  nome!: string;
  descricao!: string;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {
    this.listar();
  }

  voltarParaPainel(): void {
    this.router.navigate(['/gerente']);
  }

  mudarAba(aba: string): void {
    this.abaAtual = aba;
    if (aba === 'listar') this.listar();
  }

  listar(): void {
    this.http.get<any[]>('http://localhost:8080/exame').subscribe(res => {
      this.listaExames = res;
      this.cdr.detectChanges();
    });
  }

  criar(): void {
    const request = { nome: this.nome, descricao: this.descricao };
    this.http.post('http://localhost:8080/exame', request).subscribe({
      next: () => {
        alert("Exame cadastrado!");
        this.nome = ""; this.descricao = "";
        this.mudarAba('listar');
      },
      error: () => alert("Erro! Verifique se já não existe um exame com este nome.")
    });
  }

  prepararEdicao(exame: any): void {
    this.idBusca = exame.id;
    this.nome = exame.nome;
    this.descricao = exame.descricao;
    this.mudarAba('editar');
  }

  editar(): void {
    const request = { nome: this.nome, descricao: this.descricao };
    this.http.put('http://localhost:8080/exame/' + this.idBusca, request).subscribe({
      next: () => {
        alert("Exame atualizado!");
        this.nome = ""; this.descricao = "";
        this.mudarAba('listar');
      }
    });
  }

  deletarComConfirmacao(id: number, nome: string): void {
    if (confirm(`Excluir o exame "${nome}"?`)) {
      this.http.delete('http://localhost:8080/exame/' + id).subscribe({
        next: () => this.listar(),
        error: () => alert("Não é possível excluir. Pode haver coletas usando este exame.")
      });
    }
  }
}