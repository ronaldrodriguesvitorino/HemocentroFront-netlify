import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-hemocentro',
  imports: [FormsModule],
  templateUrl: './hemocentro.html',
  styleUrl: './hemocentro.css',
})
export class Hemocentro {
  abaAtual: string = 'listar';

  meuPessoaId!: number;

  //variaveis do ngmodel
  nomeBusca: string = '';
  resultadosNome: any[] = [];
  idBusca!: number;
  busca: any;
  listaHemocentros: any[] = [];
  descricao!: any;
  nome!: string;


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

    this.listar();
  }

  sair() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  voltarParaPainel(): void {
    this.router.navigate(['/gerente']);
  }
  mudarAba(abaSelecionada: string): void {
    this.abaAtual = abaSelecionada;
    if (this.abaAtual === 'listar') {
      this.listar();
    }
  }
  buscar(): void {
    this.http.get('/api/hemocentro/' + this.idBusca).subscribe({
      next: (resposta: any) => {
        this.busca = resposta;

        this.nome = resposta.nome;
        this.descricao = resposta.descricao;

        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.log("Erro na busca:", erro);
      }
    });
  }

  buscarPorNome(): void {
    this.busca = null;
    this.resultadosNome = [];

    if (!this.nomeBusca.trim()) {
      alert("Digite um nome para buscar.");
      return;
    }

    const termo = this.nomeBusca.toLowerCase();

    this.resultadosNome = this.listaHemocentros.filter(hemocentro =>
      hemocentro.nome && hemocentro.nome.toLowerCase().includes(termo)
    );

    if (this.resultadosNome.length === 0) {
      alert("Nenhum hemocentro encontrado com esse nome.");
    } else {
      this.cdr.detectChanges();
    }
  }

  listar(): void {
    this.http.get<any[]>('/api/hemocentro').subscribe({
      next: (resposta) => {
        this.listaHemocentros = resposta;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.log("Erro ao listar:", erro);
      }
    });
  }

  editar(): void {
    const request = {
      nome: this.nome,
      descricao: this.descricao
    };

    this.http.put('/api/hemocentro/' + this.idBusca, request).subscribe({
      next: (resposta) => {
        this.nome = "";
        this.descricao = "";
        this.idBusca = 0;
        this.mudarAba('listar');
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.log("Erro ao editar:", erro);
      }
    });
  }
  deletar(id: number): void {
    if (!id) {
      alert("Por favor, digite um ID válido.");
      return;
    }

    this.http.delete('/api/hemocentro/' + id).subscribe({
      next: (resposta) => {
        alert("Hemocentro deletado com sucesso!");
        this.idBusca = 0;
        this.mudarAba('listar');
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.log("Erro ao deletar:", erro);
        alert("Não foi possível deletar. Verifique se o ID existe ou se há coletas vinculadas a ele.");
      }
    });
  }
  criar(): void {
    const request = {
      nome: this.nome,
      descricao: this.descricao
    }
    this.http.post('/api/hemocentro', request).subscribe({
      next: (resposta) => {
        this.nome = "";
        this.descricao = "";
        this.mudarAba('listar');
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.log("Erro ao criar:", erro);
      }
    });
  }
  deletarComConfirmacao(id: number, nome: string): void {
    const confirmou = confirm(`Tem certeza absoluta que deseja excluir o hemocentro "${nome}"?`);

    if (confirmou) {
      this.http.delete('/api/hemocentro/' + id).subscribe({
        next: (resposta) => {
          alert("Hemocentro excluído com sucesso!");
          this.listar();
          this.cdr.detectChanges();
        },
        error: (erro) => {
          console.log("Erro ao deletar:", erro);
          alert("Não foi possível excluir. Verifique se existem coletas associadas a este hemocentro.");
        }
      });
    }
  }

  prepararEdicao(hemocentro: any): void {
    this.idBusca = hemocentro.id;
    this.nome = hemocentro.nome;
    this.descricao = hemocentro.descricao;

    this.mudarAba('editar');
    this.cdr.detectChanges();
  }
}
