import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coleta',
  imports: [FormsModule],
  templateUrl: './coleta.html',
  styleUrl: './coleta.css',
})
export class Coleta {
  // Abas separadas e limpas
  abaAtual: string = 'listar';

  meuPessoaId!: number;

  listaColetas: any[] = [];
  listaPessoas: any[] = [];
  listaHemocentros: any[] = [];
  listaExamesGerais: any[] = [];

  // Motor de Busca
  termoBusca: string = '';

  // Coleta 
  editandoColeta: boolean = false;
  idColetaEdicao!: number;
  dataColeta!: string;
  dataValidade!: string;
  hemocentroId!: number;
  pessoaId!: number;
  tipoSanguineoColeta: string = '';

  // Laboratório
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

    this.carregarDadosBase();
    this.listar();
  }

  sair() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  voltarParaPainel() { this.router.navigate(['/gerente']); }

  mudarAba(aba: string) {
    this.abaAtual = aba;
    if (aba === 'listar' || aba === 'laboratorio') this.listar();
  }

  carregarDadosBase() {
    this.http.get<any[]>('https://hemocentroback.onrender.com/pessoa').subscribe(res => this.listaPessoas = res);
    this.http.get<any[]>('https://hemocentroback.onrender.com/hemocentro').subscribe(res => this.listaHemocentros = res);
    this.http.get<any[]>('https://hemocentroback.onrender.com/exame').subscribe(res => this.listaExamesGerais = res);
  }

  listar() {
    this.http.get<any[]>('https://hemocentroback.onrender.com/coleta').subscribe(res => {
      this.listaColetas = res;
      this.cdr.detectChanges();
    });
  }


  get coletasFiltradas() {
    if (!this.termoBusca) return this.listaColetas;
    const termo = this.termoBusca.toLowerCase();
    return this.listaColetas.filter(c =>
      c.id.toString().includes(termo) ||
      c.dataColeta.includes(termo) ||
      c.pessoaId.toString().includes(termo) ||
      (c.tipoSanguineo && c.tipoSanguineo.toLowerCase().includes(termo))
    );
  }

  formatarDataParaBackend(dataHTML: string): string {
    if (!dataHTML) return '';
    const partes = dataHTML.split('-');
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }

  formatarDataParaHTML(dataBackend: string): string {
    if (!dataBackend) return '';
    const p = dataBackend.split('-');
    return `${p[2]}-${p[1]}-${p[0]}`;
  }

  salvarColeta() {
    if (!this.dataColeta || !this.dataValidade || !this.pessoaId || !this.hemocentroId) {
      alert("Preencha as datas, o doador e o hemocentro!");
      return;
    }

    const request = {
      dataColeta: this.formatarDataParaBackend(this.dataColeta),
      dataValidade: this.formatarDataParaBackend(this.dataValidade),
      hemocentroId: Number(this.hemocentroId),
      pessoaId: Number(this.pessoaId),
      tipoSanguineo: this.tipoSanguineoColeta || null
    };

    if (this.editandoColeta) {
      this.http.put('https://hemocentroback.onrender.com/coleta/' + this.idColetaEdicao, request).subscribe({
        next: () => {
          alert("Coleta atualizada!");
          this.limparFormularioColeta();
          this.listar();
        }
      });
    } else {
      this.http.post('https://hemocentroback.onrender.com/coleta', request).subscribe({
        next: () => {
          alert("Bolsa de sangue cadastrada!");
          this.limparFormularioColeta();
          this.listar();
        }
      });
    }
  }

  prepararEdicaoColeta(coleta: any) {
    this.editandoColeta = true;
    this.idColetaEdicao = coleta.id;
    this.dataColeta = this.formatarDataParaHTML(coleta.dataColeta);
    this.dataValidade = this.formatarDataParaHTML(coleta.dataValidade);
    this.pessoaId = coleta.pessoaId;
    this.hemocentroId = coleta.hemocentroId;
    this.tipoSanguineoColeta = coleta.tipoSanguineo || '';
    this.mudarAba('criar');
  }

  excluirColeta(id: number) {
    if (confirm(`Excluir permanentemente a coleta #${id}?`)) {
      this.http.delete('https://hemocentroback.onrender.com/coleta/' + id).subscribe({
        next: () => {
          alert("Coleta excluída!");
          if (this.coletaSelecionada?.id === id) this.coletaSelecionada = null;
          this.listar();
        },
        error: () => alert("Remova os exames vinculados a esta coleta no laboratório antes de excluí-la.")
      });
    }
  }

  limparFormularioColeta() {
    this.editandoColeta = false;
    this.dataColeta = '';
    this.dataValidade = '';
    this.pessoaId = 0;
    this.hemocentroId = 0;
    this.tipoSanguineoColeta = '';
    this.mudarAba('listar');
  }

  abrirGerenciadorDeExames(coleta: any) {
    this.coletaSelecionada = coleta;
    this.carregarExamesDaColeta(coleta.id);
    this.mudarAba('laboratorio');
  }

  carregarExamesDaColeta(coletaId: number) {
    this.http.get<any[]>('https://hemocentroback.onrender.com/exameColeta?coletaId=' + coletaId).subscribe({
      next: (res) => {
        this.examesDestaColeta = res.map(exame => ({ ...exame, editando: false, novaSituacao: exame.situacao }));
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
    if (marcados.length === 0) { alert("Marque pelo menos um exame!"); return; }

    let reqs = 0;
    marcados.forEach(exame => {
      const request = { exameId: exame.id, situacao: exame.situacao, coletaId: this.coletaSelecionada.id };
      this.http.post('https://hemocentroback.onrender.com/exameColeta', request).subscribe({
        next: () => {
          reqs++;
          if (reqs === marcados.length) {
            alert("Exames lançados com sucesso!");
            this.carregarExamesDaColeta(this.coletaSelecionada.id);
          }
        }
      });
    });
  }

  habilitarEdicao(ec: any) { ec.editando = true; }
  cancelarEdicao(ec: any) { ec.editando = false; ec.novaSituacao = ec.situacao; }

  salvarEdicao(ec: any) {
    const exOriginal = this.listaExamesGerais.find(e => e.nome === ec.nome);
    const req = { exameId: exOriginal.id, situacao: ec.novaSituacao, coletaId: this.coletaSelecionada.id };
    this.http.put('https://hemocentroback.onrender.com/exameColeta/' + ec.id, req).subscribe({
      next: () => {
        alert("Situação do exame atualizada!");
        this.carregarExamesDaColeta(this.coletaSelecionada.id);
      }
    });
  }

  obterNomePessoa(pessoaId: number): string {
    const pessoa = this.listaPessoas.find(p => p.id === pessoaId);
    return pessoa ? pessoa.nome : 'Desconhecido';
  }

  obterLabelTipoSanguineo(valorEnum: string): string {
    if (!valorEnum) return 'Pendente';
    const tipo = this.listaTiposSanguineos.find(t => t.valor === valorEnum);
    return tipo ? tipo.label : valorEnum;
  }
}