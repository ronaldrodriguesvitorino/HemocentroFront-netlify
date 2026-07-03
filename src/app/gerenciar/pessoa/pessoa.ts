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
  nomeBusca: string = '';
  resultadosNome: any[] = [];
  idBusca!: number;
  busca: any;
  listaPessoas: any[] = [];
  
  meuPessoaId!: number;

  nome!: string;
  cpf!: string;
  email!: string;

  // NOVIDADE: Motor de Busca Reativo
  termoBusca: string = '';

  get pessoasFiltradas() {
    if (!this.termoBusca) return this.listaPessoas;
    const t = this.termoBusca.toLowerCase();
    return this.listaPessoas.filter(p =>
      p.id.toString().includes(t) ||
      (p.nome && p.nome.toLowerCase().includes(t)) ||
      (p.cpf && p.cpf.includes(t)) ||
      (p.email && p.email.toLowerCase().includes(t))
    );
  }

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

  listar(): void {
    this.http.get<any[]>('/api/pessoa').subscribe({
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
    this.http.get('/api/pessoa/' + this.idBusca).subscribe({
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

  buscarPorNome(): void {
    this.busca = null;

    if (!this.nomeBusca.trim()) {
      alert("Digite um nome para buscar.");
      return;
    }

    const termo = this.nomeBusca.toLowerCase();

    // Filtra as pessoas que possuem o termo digitado no nome
    this.resultadosNome = this.listaPessoas.filter(pessoa =>
      pessoa.nome && pessoa.nome.toLowerCase().includes(termo)
    );

    if (this.resultadosNome.length === 0) {
      alert("Nenhuma pessoa encontrada com esse nome.");
    }
  }

  criar(): void {
    const request = {
      nome: this.nome,
      cpf: this.cpf,
      email: this.email
    };

    this.http.post('/api/pessoa', request).subscribe({
      next: (resposta) => {
        alert("Pessoa cadastrada com sucesso!");
        this.limparFormulario();
        this.mudarAba('listar');
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
  }

  editar(): void {
    const request = {
      nome: this.nome,
      cpf: this.cpf,
      email: this.email
    };

    this.http.put('/api/pessoa/' + this.idBusca, request).subscribe({
      next: (resposta) => {
        alert("Pessoa atualizada com sucesso!");
        this.limparFormulario();
        this.idBusca = 0;
        this.mudarAba('listar');
      },
      error: (erro) => {
        console.log("Erro ao editar:", erro);
      }
    });
  }

  deletarComConfirmacao(id: number, nome: string): void {
    const confirmou = confirm(`Tem certeza que deseja excluir a pessoa "${nome}"?`);
    if (confirmou) {
      this.http.delete('/api/pessoa/' + id).subscribe({
        next: (resposta) => {
          alert("Pessoa excluída com sucesso!");
          this.listar();
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