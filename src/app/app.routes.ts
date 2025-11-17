import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
	{
		path: 'dashboard',
		loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
		canActivate: [authGuard]
	},
	{
		path: 'perfil-risco',
		loadComponent: () => import('./pages/perfil-risco/perfil-risco.component').then(m => m.PerfilRiscoComponent),
		canActivate: [authGuard]
	},
	{
		path: 'produtos',
		loadComponent: () => import('./pages/produtos/produtos.component').then(m => m.ProdutosComponent),
		canActivate: [authGuard]
	},
	{
		path: 'simulacao',
		loadComponent: () => import('./pages/simulacao/simulacao.component').then(m => m.SimulacaoComponent),
		canActivate: [authGuard]
	},
	{
		path: 'login',
		loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
	},
	{ path: '**', redirectTo: 'dashboard' }
];
