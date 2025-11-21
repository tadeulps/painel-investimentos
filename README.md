# Painel de Investimentos CAIXA

Sistema de gerenciamento de investimentos desenvolvido com Angular 19, permitindo aos usuários visualizar, simular e gerenciar seus investimentos de forma intuitiva e segura.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 18 ou superior)
- **npm** (geralmente vem com o Node.js)
- **Angular CLI** versão 19.2.19

Para verificar se você tem o Node.js e npm instalados, execute:

```bash
node --version
npm --version
```

Para instalar o Angular CLI globalmente, execute:

```bash
npm install -g @angular/cli@19.2.19
```

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd painel-investimentos
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Inicie o servidor de API (JSON Server)

Em um terminal separado, execute:

```bash
node server.js
```

O servidor da API estará rodando em `http://localhost:3000`

**Importante:** Mantenha este terminal aberto enquanto estiver desenvolvendo.

### 4. Inicie o servidor de desenvolvimento

Em outro terminal, execute:

```bash
ng serve
```

Ou para abrir automaticamente no navegador:

```bash
ng serve --open
```

A aplicação estará disponível em `http://localhost:4200/`

## 👤 Acesso ao Sistema

Para acessar o sistema, utilize uma das seguintes credenciais de teste:

**Perfil:**
- Email: `tadeu@caixa.com`
- Senha: `123456`

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── caixa-button/
│   │   ├── confirm-investment-dialog/
│   │   ├── header/
│   │   ├── investment-evolution-chart/
│   │   ├── investments-list/
│   │   ├── page-header/
│   │   ├── product-distribution-chart/
│   │   └── risk-history-chart/
│   ├── core/
│   │   ├── guards/          # Guards de autenticação
│   │   ├── interceptors/    # Interceptors HTTP
│   │   ├── models/          # Interfaces e tipos
│   │   └── services/        # Serviços da aplicação
│   ├── pages/               # Páginas principais
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── perfil-risco/
│   │   ├── produtos/
│   │   └── simulacao/
│   └── styles/              # Estilos globais e tokens
├── assets/                  # Recursos estáticos
└── public/                  # Arquivos públicos
```

## 🧪 Testes

### Executar todos os testes

```bash
ng test
```

### Executar testes com cobertura

```bash
ng test --code-coverage
```

O relatório de cobertura será gerado em `coverage/`

### Executar testes de um componente específico

```bash
ng test --include='**/nome-do-componente.spec.ts'
```

## 🏗️ Build de Produção

Para gerar o build de produção:

```bash
ng build
```

Os arquivos otimizados serão gerados no diretório `dist/`

Para build de produção com otimizações adicionais:

```bash
ng build --configuration production
```

## 🔑 Funcionalidades Principais

### 📊 Dashboard
- Visão geral dos investimentos
- Indicadores financeiros (valor investido, rentabilidade, valor atual)
- Gráficos interativos de evolução e distribuição
- Histórico do perfil de risco

### 💼 Produtos
- Catálogo de produtos de investimento
- Produtos recomendados baseados no perfil de risco
- Filtros por tipo de produto
- Informações detalhadas de cada produto

### 🎯 Simulação
- Simulador de investimentos
- Cálculo de rentabilidade mês a mês
- Visualização de evolução do investimento
- Investimento direto após simulação

### 👥 Perfil de Risco
- Visualização do perfil atual
- Indicador de pontuação de risco
- Descrição dos perfis disponíveis
- Histórico de alterações

## 🛠️ Tecnologias Utilizadas

- **Angular 19.2.19** - Framework frontend
- **Angular Material** - Biblioteca de componentes UI
- **Chart.js** - Gráficos interativos
- **RxJS** - Programação reativa
- **JSON Server** - API REST simulada
- **TypeScript** - Linguagem de programação
- **SCSS** - Pré-processador CSS
- **Jasmine & Karma** - Framework de testes

## 📝 Scripts Disponíveis

```bash
npm start           # Inicia o servidor de desenvolvimento
npm test            # Executa os testes
npm run build       # Gera build de produção
npm run watch       # Build em modo watch
```

## 🔧 Configurações Adicionais

### API Backend

O projeto utiliza um servidor JSON Server configurado em `server.js` que simula uma API REST completa com as seguintes rotas:

- `POST /autenticacao/login` - Login de usuários
- `GET /perfil-risco/:clienteId` - Perfil de risco do usuário
- `GET /pontuacao-history/:clienteId` - Histórico de pontuação
- `GET /products` - Lista de produtos
- `GET /investimentos/:clienteId` - Investimentos do usuário
- `POST /investimentos` - Criar novo investimento

### Interceptor de Autenticação

O projeto possui um interceptor HTTP que automaticamente adiciona o token de autenticação às requisições.

## 📫 Suporte

Para dúvidas ou problemas:

1. Verifique se todas as dependências foram instaladas corretamente
2. Certifique-se de que o servidor JSON está rodando
3. Verifique se as portas 3000 e 4200 estão disponíveis
4. Limpe o cache do npm: `npm cache clean --force`
5. Remova node_modules e reinstale: `rm -rf node_modules && npm install`

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e de demonstração.
