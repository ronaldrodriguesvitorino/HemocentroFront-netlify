import { Routes } from '@angular/router';
import {Login} from './login/login';
import {Funcionario} from './tiposUsuario/funcionario/funcionario';
import {Gerente} from './tiposUsuario/gerente/gerente';
import {Doador} from './tiposUsuario/doador/doador';
import {Hemocentro} from './gerenciar/hemocentro/hemocentro';
import {Coleta} from './gerenciar/coleta/coleta';
import {Exame} from './gerenciar/exame/exame';
import {Pessoa} from './gerenciar/pessoa/pessoa';
import {Usuario} from './gerenciar/usuario/usuario';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'gerente',
    component: Gerente
  },
  {
    path: 'doador',
    component: Doador
  },
  {
    path: 'funcionario',
    component: Funcionario
  },
  {
    path: 'gerenciarHemocentro',
    component: Hemocentro
  },
  {
    path: 'gerenciarColeta',
    component: Coleta
  },
  {
    path: 'gerenciarPessoa',
    component: Pessoa
  },
  {
    path: 'gerenciarUsuario',
    component: Usuario
  },
  {
    path: 'gerenciarExame',
    component: Exame
  },

];
