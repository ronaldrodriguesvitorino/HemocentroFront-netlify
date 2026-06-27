import { Component } from '@angular/core';
import { FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-hemocentro',
  imports: [FormsModule],
  templateUrl: './hemocentro.html',
  styleUrl: './hemocentro.css',
})
export class Hemocentro {
  abaAtual : string = 'listar';
  //variaveis do ngmodel
  idBusca! : number;
  busca: any;
  listaHemocentros : any;
  descricao!: any;


  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.listar();
  }
  mudarAba(abaSelecionada : string) : void{
    this.abaAtual = abaSelecionada;
    if(this.abaAtual === 'listar'){
      this.listar();
    }
  }
  buscar(): void {
    this.http.get('http://localhost:8080/hemocentro/' + this.idBusca).subscribe({
      next: (resposta) => {
        this.busca = resposta;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.log("Erro na busca:", erro);
      }
    });
  }
  listar(): void {
    this.http.get('http://localhost:8080/hemocentro').subscribe({
      next: (resposta) => {
        this.listaHemocentros = resposta;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.log("Erro ao listar:", erro);
      }
    });
  }
  editar():void{

  }
  deletar():void{

  }
  criar():void{
    const request = {
      descricao: this.descricao
    }
    this.http.post('http://localhost:8080/hemocentro', request).subscribe({
      next: (resposta) => {
        this.descricao = "";
        this.listar();
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.log("Erro ao criar:", erro);
      }
    });
  }
}
