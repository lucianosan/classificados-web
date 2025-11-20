# Classificados Web (Frontend Angular)

Projeto frontend do Classificados, construído com Angular 20. Fornece a interface para listagem, filtros, detalhes e autenticação dos usuários, consumindo a API em `http://localhost:8080/api`.

## Visão Geral

- Framework: Angular 20 (CLI e builder moderno)
- Linguagem de estilos: SCSS global em `src/styles.scss`
- Tema: Bootswatch Lux e FontAwesome via CDN
- Assets: `public/assets` (imagens de exemplo como `iphone.jpg`, `apto.jpg`, `gol.jpg`)
- Sem dependências do template "electro" (removido). Estilos essenciais foram migrados para `styles.scss`.

## Requisitos

- Node.js 18+ (recomendado LTS)
- npm 9+
- Angular CLI 20 (`npm i -g @angular/cli` opcional)

## Instalação

```bash
npm install
```

## Execução (Desenvolvimento)

```bash
npm start
```

- Acesse `http://localhost:4200/`
- Certifique-se que a API está rodando em `http://localhost:8080` (veja o projeto `classificados-api`).

## Build (Produção)

```bash
npm run build
```

- Saída gerada em `dist/classificados-web`
- Faça deploy do conteúdo estático atrás de um servidor web (Nginx, Apache, Vercel, etc.)

## Testes

```bash
npm test
```

Executa testes unitários com Karma/Jasmine.

## Configuração de API

- Base URL está definida no código:
  - `src/app/services/auth.service.ts:8` → `private api = 'http://localhost:8080/api'`
  - `src/app/services/listing.service.ts:8` → `private api = 'http://localhost:8080/api'`
- Para produção, ajuste essas linhas para o endpoint público (ex.: `https://api.seudominio.com/api`).
- O interceptor adiciona automaticamente o header `Authorization: Bearer <token>` em chamadas autenticadas (`src/app/interceptors/api.interceptor.ts:10-13`).

## Funcionalidades Principais

- Autenticação: login e registro, com token JWT armazenado em `localStorage` (`sessionToken`).
- Listagem com filtros: busca por texto, categoria e cidade.
- Detalhe do anúncio: galeria de imagens, contato, favoritos.
- Favoritos: persistência local (`localStorage`).
- Admin (básico): módulo separado acessível via rota `/admin`.
- Contagem de visualizações: integração com endpoint `/api/listings/{id}/views`.

## Arquitetura e Pastas

- `src/app/components` — componentes de UI
  - `header` — cabeçalho com carrossel (único carrossel da aplicação)
  - `home` — listagem e filtros
  - `listing-detail` — página de detalhes
  - `listing-form` — criação de anúncio
  - `login` — autenticação
- `src/app/admin` — módulo administrativo
- `src/app/services` — serviços (HTTP)
- `src/app/interceptors` — `ApiInterceptor` para anexar JWT e tratar erros
- `src/app/guards` — guardas de rota (ex.: `auth.guard.ts`)
- `src/app/models` — modelos tipados (`listing.ts`, `user.ts`)
- `src/index.html` — inclui CDNs (Bootstrap/FontAwesome); sem scripts do template "electro"
- `src/styles.scss` — estilos globais
- `public/assets` — imagens estáticas usadas no UI

## Fluxo de Autenticação

- Login/Registro consomem `/api/auth/login` e `/api/auth/register`.
- Resposta de login inclui `token` e `user`; o token vai para `localStorage`.
- Interceptor (`src/app/interceptors/api.interceptor.ts:10-19`) injeta o token e redireciona para `/login` quando recebe `401`.

## Integração com API

- Lista de anúncios: `GET /api/listings` com parâmetros `q`, `category`, `city`, `page`, `size`.
- Detalhe de anúncio: `GET /api/listings/{id}` ou `GET /api/listings?id={id}`.
- Criar anúncio: `POST /api/listings`.
- Visualizações: `POST /api/listings/{id}/views`.

## Convenções

- SCSS global para estilos; classes utilitárias do Bootstrap.
- Componentes com nomes descritivos; serviços isolam chamadas HTTP.
- Sem dependências JS externas (como `owlcarousel`, `wow.js`, `lightbox`) — foram removidas.

## Deploy

- Gere o build (`npm run build`).
- Configure a base da API nos serviços para o domínio de produção.
- Sirva o conteúdo de `dist/classificados-web` com cache adequado de assets.

### Exemplo com Nginx (produção)

Arquivo de site (`/etc/nginx/sites-available/classificados.conf`):

```
server {
  listen 80;
  server_name classificados.seudominio.com;

  root /var/www/classificados-web/dist/classificados-web;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /assets/ {
    expires 30d;
    add_header Cache-Control "public";
  }

  location /api/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Passos:
- Copie os artefatos de `dist/classificados-web` para `/var/www/classificados-web/dist/classificados-web`.
- Habilite o site: `ln -s /etc/nginx/sites-available/classificados.conf /etc/nginx/sites-enabled/`.
- Teste a config: `nginx -t` e reinicie: `systemctl reload nginx`.

## Configuração por Ambiente (API Base URL)

Opção simples (editar diretamente nos serviços):
- `src/app/services/auth.service.ts:8` e `src/app/services/listing.service.ts:8` — altere `http://localhost:8080/api` para o endpoint público, por exemplo `https://api.seudominio.com/api`.

Opção avançada (provider Angular):
- Defina um provider em `src/main.ts` que injete a base da API e utilize nos serviços. Exemplo de referência:
  - `main.ts` fornece um token `API_BASE_URL` lendo `window` ou variável de ambiente de build.
  - Os serviços `auth.service.ts:8` e `listing.service.ts:8` passam a receber o valor via injeção ao invés de constante fixa.

Opção infra (proxy no servidor):
- Mantenha a base como relativa (ex.: `/api`) e use o Nginx para fazer proxy para o backend (como no exemplo acima). Isso evita hardcode de host no frontend.

Opção `.env` (runtime, recomendada):
- Local do arquivo: `public/.env` — servido em `/.env`.
- Variáveis suportadas: `API_BASE_URL` (ex.: `API_BASE_URL=https://api.seudominio.com/api`).
- Carregamento: `src/app/env.ts:1-24` lê `/.env` em runtime e popula `window.__env`; `src/app/app-module.ts:31-35` registra `APP_INITIALIZER` para carregar antes de iniciar o app.
- Uso: `src/app/services/auth.service.ts:8-11` e `src/app/services/listing.service.ts:8-11` usam `apiBase()` para obter a URL.
- Vantagens: troca de endpoint sem rebuild; apenas atualize o `.env` no servidor. Configure cache curto para `/.env` no Nginx.

## Problemas Comuns

- Erro de build por `environments`: este projeto não usa `src/environments`; entradas de `fileReplacements` foram removidas do `angular.json`.
- API offline: chamadas podem falhar com `0` ou `401`. Inicie a API (`classificados-api`).
- CORS: a API permite `GET /api/listings` e `/api/auth/**`; ajuste se publicar em domínios diferentes.

## Roadmap (Sugestões)

- Externalizar a base URL da API em configuração.
- Exibir geolocalização do login (campo `geo` da resposta) no UI.
- Melhorar favoritos sincronizando com backend.

## Licença

Uso interno/projeto de demonstração.
