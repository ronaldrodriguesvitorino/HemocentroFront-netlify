import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuario',
  imports: [FormsModule],
  templateUrl: './usuario.html',
  styleUrl: './usuario.css',
})
export class Usuario {
  abaAtual: string = 'listar';
  loginBusca: string = '';
  resultadosLogin: any[] = [];
  idBusca!: number;
  busca: any;

  meuPessoaId!: number;

  // Listas
  listaUsuarios: any[] = [];
  listaPessoas: any[] = [];
  listaHemocentros: any[] = [];
  listaPessoasDisponiveis: any[] = [];

  // Variáveis do formulário 
  login!: string;
  senha!: string;
  tipoPerfil!: string;
  pessoaId!: number;
  hemocentroId!: number;

  // NOVIDADE: Motor de Busca Reativo
  termoBusca: string = '';

  get usuariosFiltrados() {
    if (!this.termoBusca) return this.listaUsuarios;
    const t = this.termoBusca.toLowerCase();
    return this.listaUsuarios.filter(u =>
      u.id.toString().includes(t) ||
      (u.login && u.login.toLowerCase().includes(t)) ||
      (u.tipoPerfil && u.tipoPerfil.toLowerCase().includes(t))
    );
  }

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {
    const usuarioString = localStorage.getItem('usuarioLogado');

    if (!usuarioString) {
      this.sair();
      return;
    }

    const usuarioLogado = JSON.parse(usuarioString);

    if (usuarioLogado.tipoPerfil !== 'GERENTE') {
      alert("Acesso negado: Esta página é exclusiva para administradores/gerentes.");
      this.sair();
      return;
    }

    this.meuPessoaId = usuarioLogado.pessoaId;

    if (!this.meuPessoaId) {
      alert("Erro: Este usuário não possui um ID de gerente vinculado.");
      this.sair();
      return;
    }

    this.listarTudo();
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
      this.listarTudo();
    }
  }

  listarTudo(): void {
    this.http.get<any[]>('/api/usuario').subscribe(resUsuarios => {
      this.listaUsuarios = resUsuarios;

      this.http.get<any[]>('/api/pessoa').subscribe(resPessoas => {
        this.listaPessoas = resPessoas;

        this.listaPessoasDisponiveis = this.listaPessoas.filter(pessoa => {
          const pessoaJaTemAcesso = this.listaUsuarios.some(usuario => {
            const idVinculado = usuario.pessoa ? usuario.pessoa.id : usuario.pessoaId;
            return idVinculado === pessoa.id;
          });
          return !pessoaJaTemAcesso;
        });

        this.cdr.detectChanges();
      });
    });

    this.http.get<any[]>('/api/hemocentro').subscribe(resHemocentros => {
      this.listaHemocentros = resHemocentros;
      this.cdr.detectChanges();
    });
  }

  buscar(): void {
    if (!this.idBusca) {
      alert("Digite um ID válido.");
      return;
    }
    this.http.get('/api/usuario/' + this.idBusca).subscribe({
      next: (resposta) => {
        this.busca = resposta;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.log("Erro na busca:", erro);
        alert("Usuário não encontrado.");
      }
    });
  }

  buscarPorLogin(): void {
    this.busca = null;
    this.resultadosLogin = [];

    if (!this.loginBusca.trim()) {
      alert("Digite um login para buscar.");
      return;
    }

    const termo = this.loginBusca.toLowerCase();

    this.resultadosLogin = this.listaUsuarios.filter(usuario =>
      usuario.login && usuario.login.toLowerCase().includes(termo)
    );

    if (this.resultadosLogin.length === 0) {
      alert("Nenhum usuário encontrado com esse login.");
    } else {
      this.cdr.detectChanges();
    }
  }

  criar(): void {
    const request = {
      login: this.login,
      senha: this.senha,
      tipoPerfil: this.tipoPerfil,
      pessoaId: this.pessoaId,
      hemocentroId: this.hemocentroId
    };

    this.http.post('/api/usuario', request).subscribe({
      next: (resposta) => {
        alert("Usuário cadastrado com sucesso!");
        this.limparFormulario();
        this.mudarAba('listar');
      },
      error: (erro) => {
        console.log("Erro ao criar:", erro);
        alert("Erro ao cadastrar. Verifique se o login já existe ou se preencheu tudo.");
      }
    });
  }

  prepararEdicao(usuario: any): void {
    this.idBusca = usuario.id;
    this.login = usuario.login;
    this.senha = ""; // vazio por segurança
    this.tipoPerfil = usuario.tipoPerfil;

    this.pessoaId = usuario.pessoa ? usuario.pessoa.id : usuario.pessoaId;
    this.hemocentroId = usuario.hemocentro ? usuario.hemocentro.id : usuario.hemocentroId;

    this.mudarAba('editar');
  }

  editar(): void {
    const request = {
      login: this.login,
      senha: this.senha,
      tipoPerfil: this.tipoPerfil,
      pessoaId: this.pessoaId,
      hemocentroId: this.hemocentroId
    };

    this.http.put('/api/usuario/' + this.idBusca, request).subscribe({
      next: (resposta) => {
        alert("Usuário atualizado com sucesso!");
        this.limparFormulario();
        this.idBusca = 0;
        this.mudarAba('listar');
      },
      error: (erro) => {
        console.log("Erro ao editar:", erro);
        alert("Erro ao editar. Lembre-se de preencher uma senha válida.");
      }
    });
  }

  deletarComConfirmacao(id: number, login: string): void {
    const confirmou = confirm(`Tem certeza que deseja excluir o acesso do usuário "${login}"?`);
    if (confirmou) {
      this.http.delete('/api/usuario/' + id).subscribe({
        next: (resposta) => {
          alert("Usuário excluído com sucesso!");
          this.listarTudo();
        },
        error: (erro) => {
          console.log("Erro ao deletar:", erro);
          alert("Não foi possível excluir este usuário.");
        }
      });
    }
  }

  limparFormulario(): void {
    this.login = "";
    this.senha = "";
    this.tipoPerfil = "";
    this.pessoaId = 0;
    this.hemocentroId = 0;
  }
}