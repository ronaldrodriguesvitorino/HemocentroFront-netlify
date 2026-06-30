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
  abaAtual: string = 'listar';
  
  listaColetas: any[] = [];
  listaPessoas: any[] = [];
  listaHemocentros: any[] = [];
  listaExamesGerais: any[] = [];
  
  // Variáveis da Coleta
  coletaSelecionada: any; 
  dataColeta!: string; 
  dataValidade!: string;
  hemocentroId!: number;
  pessoaId!: number;

  // Checkboxes e Edição
  examesDestaColeta: any[] = []; 
  examesDisponiveisParaLancar: any[] = []; 

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {
    this.carregarDadosBase();
    this.listar();
  }

  voltarParaPainel() { this.router.navigate(['/gerente']); }

  mudarAba(aba: string) {
    this.abaAtual = aba;
    if (aba === 'listar') this.listar();
  }

  carregarDadosBase() {
    this.http.get<any[]>('http://localhost:8080/pessoa').subscribe(res => this.listaPessoas = res);
    this.http.get<any[]>('http://localhost:8080/hemocentro').subscribe(res => this.listaHemocentros = res);
    this.http.get<any[]>('http://localhost:8080/exame').subscribe(res => this.listaExamesGerais = res);
  }

  listar() {
    this.http.get<any[]>('http://localhost:8080/coleta').subscribe(res => {
      this.listaColetas = res;
      this.cdr.detectChanges();
    });
  }

  formatarDataParaBackend(dataHTML: string): string {
    const partes = dataHTML.split('-');
    return `${partes[2]}-${partes[1]}-${partes[0]}`; 
  }

  criarColeta() {
    const request = {
      dataColeta: this.formatarDataParaBackend(this.dataColeta),
      dataValidade: this.formatarDataParaBackend(this.dataValidade),
      hemocentroId: this.hemocentroId,
      pessoaId: this.pessoaId
    };

    this.http.post('http://localhost:8080/coleta', request).subscribe({
      next: () => {
        alert("Bolsa de sangue cadastrada!");
        this.mudarAba('listar');
      },
      error: (err) => console.log(err)
    });
  }

  abrirGerenciadorDeExames(coleta: any) {
    this.coletaSelecionada = coleta;
    this.carregarExamesDaColeta(coleta.id);
    this.mudarAba('exames-coleta');
  }

  carregarExamesDaColeta(coletaId: number) {
    this.http.get<any[]>('http://localhost:8080/exameColeta?coletaId=' + coletaId).subscribe({
      next: (res) => {
        this.examesDestaColeta = res.map(exame => ({
          ...exame, 
          editando: false, 
          novaSituacao: exame.situacao 
        }));
        
        this.atualizarListaDeCheckboxes();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.examesDestaColeta = [];
        this.atualizarListaDeCheckboxes();
      }
    });
  }

  atualizarListaDeCheckboxes() {
    this.examesDisponiveisParaLancar = this.listaExamesGerais
      .filter(exameGeral => {
        const jaFoiLancado = this.examesDestaColeta.some(lancado => lancado.nome === exameGeral.nome);
        return !jaFoiLancado;
      })
      .map(exame => ({
        id: exame.id,
        nome: exame.nome,
        selecionado: false, 
        situacao: 'PENDENTE' 
      }));
  }

  salvarExamesEmMassa() {
    const examesMarcados = this.examesDisponiveisParaLancar.filter(e => e.selecionado);

    if (examesMarcados.length === 0) {
      alert("Marque pelo menos um exame na caixinha antes de salvar.");
      return;
    }

    let requisicoesFeitas = 0;

    examesMarcados.forEach(exame => {
      const request = {
        exameId: exame.id,
        situacao: exame.situacao,
        coletaId: this.coletaSelecionada.id
      };

      this.http.post('http://localhost:8080/exameColeta', request).subscribe({
        next: () => {
          requisicoesFeitas++;
          if (requisicoesFeitas === examesMarcados.length) {
            alert("Exames lançados com sucesso!");
            this.carregarExamesDaColeta(this.coletaSelecionada.id);
          }
        }
      });
    });
  }

  habilitarEdicao(ec: any) {
    ec.editando = true;
  }

  cancelarEdicao(ec: any) {
    ec.editando = false;
    ec.novaSituacao = ec.situacao; 
  }

  salvarEdicao(ec: any) {
    const examenOriginal = this.listaExamesGerais.find(e => e.nome === ec.nome);

    const request = {
      exameId: examenOriginal.id,
      situacao: ec.novaSituacao,
      coletaId: this.coletaSelecionada.id
    };

    this.http.put('http://localhost:8080/exameColeta/' + ec.id, request).subscribe({
      next: () => {
        alert("Situação do exame atualizada!");
        this.carregarExamesDaColeta(this.coletaSelecionada.id);
      },
      error: () => alert("Erro ao atualizar a situação.")
    });
  }
}