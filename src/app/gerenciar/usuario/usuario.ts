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
  
  idBusca!: number;
  busca: any;
  
  // Listas para a tabela e para os Dropdowns 
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

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {
    this.listarTudo();
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

  // Carrega todos os dados necessários para a tela funcionar
  listarTudo(): void {
    //busca o usuário
    this.http.get<any[]>('http://localhost:8080/usuario').subscribe(resUsuarios => {
      this.listaUsuarios = resUsuarios;

      //busca as pessoas
      this.http.get<any[]>('http://localhost:8080/pessoa').subscribe(resPessoas => {
        this.listaPessoas = resPessoas;

        // FILTRO: 
        // Verifica que não está na lista de pessoa já atribuidas
        this.listaPessoasDisponiveis = this.listaPessoas.filter(pessoa => {
          const pessoaJaTemAcesso = this.listaUsuarios.some(usuario => {
            const idVinculado = usuario.pessoa ? usuario.pessoa.id : usuario.pessoaId;
            return idVinculado === pessoa.id;
          });
          
          // Se não tem acesso, retorna true para manter na lista do Dropdown
          return !pessoaJaTemAcesso;
        });

        this.cdr.detectChanges();
      });
    });

    //Busca os Hemocentros 
    this.http.get<any[]>('http://localhost:8080/hemocentro').subscribe(resHemocentros => {
      this.listaHemocentros = resHemocentros;
      this.cdr.detectChanges();
    });
  }

  buscar(): void {
    if (!this.idBusca) {
      alert("Digite um ID válido.");
      return;
    }
    this.http.get('http://localhost:8080/usuario/' + this.idBusca).subscribe({
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

  criar(): void {
    const request = {
      login: this.login,
      senha: this.senha,
      tipoPerfil: this.tipoPerfil,
      pessoaId: this.pessoaId,
      hemocentroId: this.hemocentroId
    };

    this.http.post('http://localhost:8080/usuario', request).subscribe({
      next: (resposta) => {
        alert("Usuário cadastrado com sucesso!");
        this.limparFormulario();
        this.mudarAba('listar');
        this.cdr.detectChanges();
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
    
    //Linha para evitar que volte um objeto, e não uma ID
    this.pessoaId = usuario.pessoa ? usuario.pessoa.id : usuario.pessoaId;
    this.hemocentroId = usuario.hemocentro ? usuario.hemocentro.id : usuario.hemocentroId;

    this.mudarAba('editar');
    this.cdr.detectChanges();
  }

  editar(): void {
    const request = {
      login: this.login,
      senha: this.senha,
      tipoPerfil: this.tipoPerfil,
      pessoaId: this.pessoaId,
      hemocentroId: this.hemocentroId
    };

    this.http.put('http://localhost:8080/usuario/' + this.idBusca, request).subscribe({
      next: (resposta) => {
        alert("Usuário atualizado com sucesso!");
        this.limparFormulario();
        this.idBusca = 0;
        this.mudarAba('listar');
        this.cdr.detectChanges();
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
      this.http.delete('http://localhost:8080/usuario/' + id).subscribe({
        next: (resposta) => {
          alert("Usuário excluído com sucesso!");
          this.listarTudo();
          this.cdr.detectChanges();
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