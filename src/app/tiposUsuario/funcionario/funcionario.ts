import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-funcionario',
  imports: [FormsModule],
  templateUrl: './funcionario.html',
  styleUrl: './funcionario.css', 
})
export class Funcionario {
  abaPrincipal: string = 'coletas'; 
  
  listaDoadores: any[] = [];
  listaColetas: any[] = [];
  listaHemocentros: any[] = [];
  listaExamesGerais: any[] = [];

  // =====================================
  // MOTORES DE BUSCA (FILTROS REATIVOS)
  // =====================================
  termoBuscaDoador: string = '';
  termoBuscaColeta: string = '';
  termoBuscaLab: string = '';

  get doadoresFiltrados() {
    if (!this.termoBuscaDoador) return this.listaDoadores;
    const t = this.termoBuscaDoador.toLowerCase();
    return this.listaDoadores.filter(d => 
      d.id.toString().includes(t) || d.nome.toLowerCase().includes(t) || 
      d.cpf.includes(t) || d.email.toLowerCase().includes(t)
    );
  }

  get coletasFiltradas() {
    if (!this.termoBuscaColeta) return this.listaColetas;
    const t = this.termoBuscaColeta.toLowerCase();
    return this.listaColetas.filter(c => 
      c.id.toString().includes(t) || c.dataColeta.includes(t) || 
      c.pessoaId.toString().includes(t) || 
      (c.tipoSanguineo && c.tipoSanguineo.toLowerCase().includes(t))
    );
  }

  get coletasLabFiltradas() {
    if (!this.termoBuscaLab) return this.listaColetas;
    const t = this.termoBuscaLab.toLowerCase();
    return this.listaColetas.filter(c => 
      c.id.toString().includes(t) || c.dataColeta.includes(t) || 
      (c.tipoSanguineo && c.tipoSanguineo.toLowerCase().includes(t))
    );
  }

  // Variáveis - Doador
  nome!: string;
  cpf!: string;
  email!: string;
  hemocentroIdDoador!: number;

  // Variáveis - Coleta (CRUD)
  editandoColeta: boolean = false;
  idColetaEdicao!: number;
  dataColeta!: string; 
  dataValidade!: string;
  hemocentroIdColeta!: number;
  pessoaIdColeta!: number;
  tipoSanguineoColeta: string = ''; 

  // Variáveis - Laboratório (Exames)
  coletaSelecionada: any;
  examesDestaColeta: any[] = [];
  examesDisponiveisParaLancar: any[] = [];

  listaTiposSanguineos = [
    { valor: 'A_POSITIVO', label: 'A+' }, { valor: 'A_NEGATIVO', label: 'A-' },
    { valor: 'B_POSITIVO', label: 'B+' }, { valor: 'B_NEGATIVO', label: 'B-' },
    { valor: 'AB_POSITIVO', label: 'AB+' }, { valor: 'AB_NEGATIVO', label: 'AB-' },
    { valor: 'O_POSITIVO', label: 'O+' }, { valor: 'O_NEGATIVO', label: 'O-' }
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {
    this.carregarDadosBase();
    this.listarColetas();
  }

  sair() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  mudarAbaPrincipal(aba: string) {
    this.abaPrincipal = aba;
    this.carregarDadosBase();
    if (aba === 'coletas' || aba === 'laboratorio') {
      this.listarColetas();
    }
  }

  carregarDadosBase() {
    this.http.get<any[]>('http://localhost:8080/pessoa').subscribe(res => this.listaDoadores = res);
    this.http.get<any[]>('http://localhost:8080/hemocentro').subscribe(res => this.listaHemocentros = res);
    this.http.get<any[]>('http://localhost:8080/exame').subscribe(res => this.listaExamesGerais = res);
  }

  // ==========================================
  // MÓDULO 1: DOADORES
  // ==========================================
  cadastrarDoador() {
    if (!this.nome || !this.cpf || !this.email || !this.hemocentroIdDoador) {
      alert("Por favor, preencha todos os campos do doador!");
      return;
    }
    const requestPessoa = { nome: this.nome, cpf: this.cpf, email: this.email };
    this.http.post<any>('http://localhost:8080/pessoa', requestPessoa).subscribe({
      next: (pessoaCriada) => {
        const loginFormatado = this.nome.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").split(' ').join('.');
        const requestUsuario = {
          login: loginFormatado, senha: this.cpf, tipoPerfil: 'USUARIO', 
          pessoaId: pessoaCriada.id, hemocentroId: Number(this.hemocentroIdDoador)
        };
        this.http.post('http://localhost:8080/usuario', requestUsuario).subscribe({
          next: () => {
            alert(`Doador cadastrado!\nLogin: ${loginFormatado}\nSenha: ${this.cpf}`);
            this.nome = ''; this.cpf = ''; this.email = '';
            this.carregarDadosBase();
          }
        });
      },
      error: (err) => alert("Erro ao criar Pessoa: " + JSON.stringify(err.error))
    });
  }

  // ==========================================
  // MÓDULO 2: GESTÃO DE COLETAS
  // ==========================================
  listarColetas() {
    this.http.get<any[]>('http://localhost:8080/coleta').subscribe(res => {
      this.listaColetas = res;
      this.cdr.detectChanges();
    });
  }

  formatarDataParaBackend(dataHTML: string): string {
    const p = dataHTML.split('-');
    return `${p[2]}-${p[1]}-${p[0]}`; 
  }

  formatarDataParaHTML(dataBackend: string): string {
    if (!dataBackend) return '';
    const p = dataBackend.split('-');
    return `${p[2]}-${p[1]}-${p[0]}`; 
  }

  salvarColeta() {
    if (!this.dataColeta || !this.dataValidade || !this.pessoaIdColeta || !this.hemocentroIdColeta) {
      alert("Preencha as datas, o doador e o hemocentro!");
      return;
    }

    const request = {
      dataColeta: this.formatarDataParaBackend(this.dataColeta),
      dataValidade: this.formatarDataParaBackend(this.dataValidade),
      hemocentroId: Number(this.hemocentroIdColeta),
      pessoaId: Number(this.pessoaIdColeta),
      tipoSanguineo: this.tipoSanguineoColeta || null 
    };

    if (this.editandoColeta) {
      this.http.put('http://localhost:8080/coleta/' + this.idColetaEdicao, request).subscribe({
        next: () => {
          alert("Coleta atualizada com sucesso!");
          this.limparFormularioColeta();
          this.listarColetas();
        }
      });
    } else {
      this.http.post('http://localhost:8080/coleta', request).subscribe({
        next: () => {
          alert("Nova bolsa de sangue registrada!");
          this.limparFormularioColeta();
          this.listarColetas();
        }
      });
    }
  }

  prepararEdicaoColeta(coleta: any) {
    this.editandoColeta = true;
    this.idColetaEdicao = coleta.id;
    this.dataColeta = this.formatarDataParaHTML(coleta.dataColeta);
    this.dataValidade = this.formatarDataParaHTML(coleta.dataValidade);
    this.pessoaIdColeta = coleta.pessoaId;
    this.hemocentroIdColeta = coleta.hemocentroId;
    this.tipoSanguineoColeta = coleta.tipoSanguineo || ''; 
  }

  excluirColeta(id: number) {
    if (confirm(`Excluir permanentemente a coleta #${id}?`)) {
      this.http.delete('http://localhost:8080/coleta/' + id).subscribe({
        next: () => {
          alert("Coleta excluída!");
          if (this.coletaSelecionada?.id === id) this.coletaSelecionada = null;
          this.listarColetas();
        },
        error: () => alert("Erro ao excluir. Remova os exames vinculados a ela primeiro no laboratório.")
      });
    }
  }

  limparFormularioColeta() {
    this.editandoColeta = false;
    this.dataColeta = '';
    this.dataValidade = '';
    this.pessoaIdColeta = 0;
    this.hemocentroIdColeta = 0;
    this.tipoSanguineoColeta = '';
  }

  // ==========================================
  // MÓDULO 3: LABORATÓRIO (EXAMES)
  // ==========================================
  abrirExames(coleta: any) {
    this.coletaSelecionada = coleta;
    this.carregarExamesDaColeta(coleta.id);
  }

  carregarExamesDaColeta(coletaId: number) {
    this.http.get<any[]>('http://localhost:8080/exameColeta?coletaId=' + coletaId).subscribe({
      next: (res) => {
        this.examesDestaColeta = res.map(e => ({ ...e, editando: false, novaSituacao: e.situacao }));
        this.atualizarListaDeCheckboxes();
        this.cdr.detectChanges();
      },
      error: () => {
        this.examesDestaColeta = [];
        this.atualizarListaDeCheckboxes();
      }
    });
  }

  atualizarListaDeCheckboxes() {
    this.examesDisponiveisParaLancar = this.listaExamesGerais
      .filter(exGeral => !this.examesDestaColeta.some(lancado => lancado.nome === exGeral.nome))
      .map(ex => ({ id: ex.id, nome: ex.nome, selecionado: false, situacao: 'PENDENTE' }));
  }

  salvarExamesEmMassa() {
    const marcados = this.examesDisponiveisParaLancar.filter(e => e.selecionado);
    if (marcados.length === 0) { alert("Selecione ao menos um exame na caixinha!"); return; }

    let enviados = 0;
    marcados.forEach(ex => {
      const request = { exameId: ex.id, situacao: ex.situacao, coletaId: this.coletaSelecionada.id };
      this.http.post('http://localhost:8080/exameColeta', request).subscribe({
        next: () => {
          enviados++;
          if (enviados === marcados.length) {
            alert("Exames lançados com sucesso!");
            this.carregarExamesDaColeta(this.coletaSelecionada.id);
          }
        }
      });
    });
  }

  habilitarEdicaoExame(ec: any) { ec.editando = true; }
  cancelarEdicaoExame(ec: any) { ec.editando = false; ec.novaSituacao = ec.situacao; }

  salvarEdicaoExame(ec: any) {
    const exameOriginal = this.listaExamesGerais.find(e => e.nome === ec.nome);
    const request = { exameId: exameOriginal.id, situacao: ec.novaSituacao, coletaId: this.coletaSelecionada.id };

    this.http.put('http://localhost:8080/exameColeta/' + ec.id, request).subscribe({
      next: () => {
        alert("Situação laboratorial atualizada!");
        this.carregarExamesDaColeta(this.coletaSelecionada.id);
      }
    });
  }
}