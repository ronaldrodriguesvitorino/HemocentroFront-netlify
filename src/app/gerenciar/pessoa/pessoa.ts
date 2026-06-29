import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pessoa',
  imports: [FormsModule],
  templateUrl: './pessoa.html',
  styleUrl: './pessoa.css',
})
export class Pessoa {
  abaAtual: string = 'listar';
  
  idBusca!: number;
  busca: any;
  listaPessoas: any[] = [];

  nome!: string;
  cpf!: string;
  email!: string;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {
    this.listar();
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

  listar(): void {
    this.http.get<any[]>('http://localhost:8080/pessoa').subscribe({
      next: (resposta) => {
        this.listaPessoas = resposta;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.log("Erro ao listar pessoas:", erro);
      }
    });
  }

  buscar(): void {
    if (!this.idBusca) {
      alert("Digite um ID válido.");
      return;
    }
    this.http.get('http://localhost:8080/pessoa/' + this.idBusca).subscribe({
      next: (resposta) => {
        this.busca = resposta;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.log("Erro na busca:", erro);
        alert("Pessoa não encontrada.");
      }
    });
  }

  criar(): void {
    const request = {
      nome: this.nome,
      cpf: this.cpf,
      email: this.email
    };

    this.http.post('http://localhost:8080/pessoa', request).subscribe({
      next: (resposta) => {
        alert("Pessoa cadastrada com sucesso!");
        this.limparFormulario();
        this.mudarAba('listar');
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.log("Erro ao criar:", erro);
        alert("Erro ao cadastrar. Verifique se o CPF e E-mail já não estão em uso.");
      }
    });
  }

  prepararEdicao(pessoa: any): void {
    this.idBusca = pessoa.id;
    this.nome = pessoa.nome;
    this.cpf = pessoa.cpf;
    this.email = pessoa.email;
    this.mudarAba('editar');
    this.cdr.detectChanges();
  }

  editar(): void {
    const request = {
      nome: this.nome,
      cpf: this.cpf,
      email: this.email
    };

    this.http.put('http://localhost:8080/pessoa/' + this.idBusca, request).subscribe({
      next: (resposta) => {
        alert("Pessoa atualizada com sucesso!");
        this.limparFormulario();
        this.idBusca = 0;
        this.mudarAba('listar');
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.log("Erro ao editar:", erro);
      }
    });
  }

  deletarComConfirmacao(id: number, nome: string): void {
    const confirmou = confirm(`Tem certeza que deseja excluir a pessoa "${nome}"?`);
    if (confirmou) {
      this.http.delete('http://localhost:8080/pessoa/' + id).subscribe({
        next: (resposta) => {
          alert("Pessoa excluída com sucesso!");
          this.listar();
          this.cdr.detectChanges();
        },
        error: (erro) => {
          console.log("Erro ao deletar:", erro);
          alert("Não foi possível excluir. Talvez existam usuários ou coletas vinculadas a esta pessoa.");
        }
      });
    }
  }

  limparFormulario(): void {
    this.nome = "";
    this.cpf = "";
    this.email = "";
  }
}