# NLW Agents

Aplicação fullstack desenvolvida durante o evento **NLW da Rocketseat**, com foco em **Inteligência Artificial aplicada à educação**.

O sistema captura áudio de aulas em tempo real, transcreve o conteúdo usando IA, gera embeddings vetoriais para busca semântica e responde perguntas dos alunos de forma contextualizada usando **RAG (Retrieval-Augmented Generation)**.

---

## Destaques do Projeto

- **Transcrição de áudio em tempo real** — captura áudio do microfone em chunks de 5 segundos e transcreve via Google Gemini
- **Busca semântica com embeddings vetoriais** — pgvector com vetores de 768 dimensões para encontrar trechos relevantes
- **RAG (Retrieval-Augmented Generation)** — respostas geradas com base no contexto real da aula
- **Arquitetura fullstack moderna** — backend Fastify + frontend React 19 com TypeScript end-to-end
- **Type safety completa** — Zod para validação em runtime + TypeScript para tipagem estática
- **Testes automatizados** — Jest + Testing Library com cobertura mínima configurada

---

## Arquitetura Geral

```
┌─────────────────┐     HTTP/REST      ┌─────────────────────┐
│                 │ ◄──────────────────► │                     │
│   Frontend      │                     │   Backend           │
│   React 19      │                     │   Fastify           │
│   Vite          │                     │   Node.js 22        │
│   TanStack Query│                     │                     │
│                 │                     │   ┌───────────────┐ │
└─────────────────┘                     │   │ Google Gemini │ │
                                        │   │ - Transcrição │ │
                                        │   │ - Embeddings  │ │
                                        │   │ - RAG         │ │
                                        │   └───────────────┘ │
                                        │          │          │
                                        │   ┌──────▼────────┐ │
                                        │   │  PostgreSQL   │ │
                                        │   │  + pgvector   │ │
                                        │   └───────────────┘ │
                                        └─────────────────────┘
```

---

## Tecnologias Utilizadas

### Backend

| Tecnologia | Versão | Função |
|---|---|---|
| **Node.js** | 22+ | Runtime com `--experimental-strip-types` (TS nativo) |
| **TypeScript** | 5.8 | Tipagem estática |
| **Fastify** | 5.4 | Framework web de alta performance |
| **Drizzle ORM** | 0.44 | ORM SQL-first com type safety |
| **PostgreSQL** | 17 | Banco de dados relacional |
| **pgvector** | - | Extensão para busca vetorial (embeddings 768-dim) |
| **Google Gemini** | @google/genai 1.9 | IA: transcrição, embeddings e geração de respostas |
| **Zod** | 3.25 | Validação de schemas e tipos em runtime |
| **@fastify/cors** | 11.0 | Middleware CORS |
| **@fastify/multipart** | 9.0 | Upload de arquivos (áudio) |
| **Biome** | 2.0 | Linting e formatação |
| **Jest** | 29.7 | Testes unitários |

### Frontend

| Tecnologia | Versão | Função |
|---|---|---|
| **React** | 19.1 | Biblioteca de UI |
| **Vite** | 7.0 | Build tool e dev server |
| **TypeScript** | 5.8 | Tipagem estática |
| **React Router DOM** | 7.6 | Roteamento SPA |
| **TanStack React Query** | 5.82 | Gerenciamento de estado assíncrono (cache, mutations) |
| **React Hook Form** | 7.60 | Gerenciamento de formulários |
| **Zod** | 4.0 | Validação client-side |
| **Tailwind CSS** | 4.1 | Estilização utility-first |
| **shadcn/ui** | - | Componentes acessíveis (Radix UI) |
| **lucide-react** | 0.525 | Ícones SVG |
| **dayjs** | 1.11 | Formatação de datas relativas |
| **class-variance-authority** | 0.7 | Variantes CSS para componentes |
| **clsx + tailwind-merge** | - | Composição dinâmica de classes |
| **Jest + Testing Library** | 29.7 / 16.1 | Testes unitários e de componentes |
| **Biome** | 2.0 | Linting e formatação |

### Infraestrutura (dev)

| Tecnologia | Função |
|---|---|
| **Docker + Docker Compose** | PostgreSQL + pgvector local |

---

## Estrutura do Projeto

```
nlw-agents/
├── server/                       # Backend (ver server/README.md)
│   ├── src/
│   │   ├── server.ts             # Setup do Fastify
│   │   ├── env.ts                # Validação de env vars com Zod
│   │   ├── http/routes/          # Endpoints da API
│   │   ├── services/gemini.ts    # Integração com Google Gemini
│   │   ├── db/                   # Schema, migrations, seed
│   │   └── __tests__/            # Testes unitários
│   ├── docker-compose.yml    # PostgreSQL + pgvector
│   └── jest.config.ts
│
├── web/                          # Frontend (ver web/README.md)
│   ├── src/
│   │   ├── pages/                # Páginas (criar sala, sala, gravar áudio)
│   │   ├── components/           # Componentes React + shadcn/ui
│   │   ├── http/                 # Hooks de integração com API
│   │   ├── lib/                  # Utilitários (cn, dayjs)
│   │   └── __tests__/            # Testes de componentes e hooks
│   ├── jest.config.ts
│   └── vite.config.ts
```

---

## Banco de Dados

### Schema

```sql
-- Extensão para busca vetorial
CREATE EXTENSION IF NOT EXISTS vector;

-- Salas de aula
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Perguntas e respostas
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id),
  question TEXT NOT NULL,
  answer TEXT,                    -- Resposta gerada pela IA
  created_at TIMESTAMP DEFAULT now()
);

-- Chunks de áudio transcritos + embeddings
CREATE TABLE audio_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id),
  transcription TEXT NOT NULL,    -- Transcrição do áudio
  embeddings VECTOR(768) NOT NULL, -- Embedding vetorial (768 dimensões)
  created_at TIMESTAMP DEFAULT now()
);
```

### Busca Vetorial (pgvector)

- **Modelo de embedding**: `text-embedding-004` (768 dimensões)
- **Operador**: `<=>` (distância cosseno)
- **Threshold de similaridade**: 0.7
- **Top K**: 3 chunks mais relevantes

---

## API Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/rooms` | Lista todas as salas com contagem de perguntas |
| `POST` | `/rooms` | Cria uma nova sala |
| `GET` | `/rooms/:roomId/questions` | Lista perguntas e respostas de uma sala |
| `POST` | `/rooms/:roomId/questions` | Envia uma pergunta (resposta gerada por IA via RAG) |
| `POST` | `/rooms/:roomId/audio` | Upload de chunk de áudio (multipart/form-data) |

### Fluxo de Processamento

**Upload de Áudio:**
1. Frontend grava áudio em chunks de 5 segundos via Web Audio API
2. Chunk enviado ao backend como multipart/form-data
3. Gemini transcreve o áudio para texto (pt-BR)
4. Sistema gera embeddings vetoriais (768 dimensões)
5. Transcrição + embeddings armazenados na tabela `audio_chunks`

**Pergunta com RAG:**
1. Usuário envia pergunta
2. Sistema gera embedding da pergunta
3. Busca semântica no pgvector (cosseno, threshold 0.7)
4. Recupera os 3 chunks mais similares
5. Gemini gera resposta contextualizada com os trechos relevantes
6. Resposta armazenada junto à pergunta

---

## Conceitos e Padrões Aprendidos

### IA e Machine Learning
- **RAG (Retrieval-Augmented Generation)** — técnica que combina busca semântica com geração de texto para respostas contextualizadas
- **Embeddings vetoriais** — representações numéricas de texto que capturam significado semântico
- **Busca por similaridade cosseno** — encontrar textos semanticamente similares usando distância vetorial
- **Transcrição de áudio com IA** — conversão de fala em texto usando modelos multimodais

### Backend
- **Fastify plugins pattern** — cada rota é um plugin isolado registrado no servidor
- **Type Provider com Zod** — validação de request/response com inferência automática de tipos
- **Drizzle ORM (SQL-first)** — ORM que prioriza SQL puro com total type safety
- **pgvector** — extensão PostgreSQL para armazenar e consultar vetores de alta dimensão
- **Node.js 22 com TypeScript nativo** — uso de `--experimental-strip-types` sem necessidade de transpilação
- **Upload multipart** — processamento de arquivos de áudio com `@fastify/multipart`
- **Validação de env vars** — uso de Zod para garantir variáveis de ambiente tipadas

### Frontend
- **React 19** — última versão com melhorias de performance
- **TanStack React Query** — cache inteligente, invalidação automática, mutations com callbacks
- **React Hook Form + Zod** — formulários performáticos com validação declarativa
- **Custom Hooks para API** — abstração da camada HTTP em hooks reutilizáveis (`useRooms`, `useCreateRoom`, etc.)
- **Web Audio API + MediaRecorder** — captura de áudio do microfone com echo cancellation e noise suppression
- **shadcn/ui** — componentes acessíveis e customizáveis baseados em Radix UI
- **Tailwind CSS utility-first** — estilização com classes utilitárias + `cn()` para composição dinâmica
- **Path aliases** — uso de `@/` para imports limpos via `tsconfig.json`

### Testes
- **Jest + ts-jest** — testes unitários com suporte a TypeScript e ESM
- **Testing Library** — testes de componentes React focados no comportamento do usuário
- **Mocking de módulos** — simulação de dependências (banco, API, Gemini) para testes isolados
- **Coverage thresholds** — mínimo de 70% (backend) e 60% (frontend) em branches, functions e lines

### Qualidade de Código
- **Biome** — linter e formatter unificado (substituto do ESLint + Prettier)
- **TypeScript strict mode** — máxima segurança de tipos
- **Zod schemas** — single source of truth para validação e tipos
- **Docker Compose** — ambiente de desenvolvimento reproduzível

---

## Setup Local

### Pré-requisitos

- Node.js 22+
- Docker e Docker Compose
- Chave de API do [Google Gemini](https://aistudio.google.com/apikeys)

### 1. Clone o repositório

```bash
git clone https://github.com/mbdevlabs/nlw-agents.git
cd nlw-agents
```

### 2. Backend

```bash
cd server
docker compose up -d              # PostgreSQL + pgvector
npm install
cp .env.example .env              # edite com sua GEMINI_API_KEY
npx drizzle-kit migrate
npm run dev                       # http://localhost:3333
```

### 3. Frontend

```bash
cd web
npm install
echo "VITE_API_URL=http://localhost:3333" > .env
npm run dev                       # http://localhost:5173
```

### Variáveis de Ambiente

**Server (.env)**
```env
PORT=3333
DATABASE_URL=postgresql://docker:docker@localhost:5432/agents
GEMINI_API_KEY=sua_chave_aqui
```

**Web (.env)**
```env
VITE_API_URL=http://localhost:3333
```

---

## Testes

```bash
# Backend
cd server
npm test              # Executar testes
npm run test:watch    # Modo watch
npm run test:coverage # Relatório de cobertura

# Frontend
cd web
npm test              # Executar testes
npm run test:watch    # Modo watch
npm run test:coverage # Relatório de cobertura
```

---

## Troubleshooting

| Problema | Solução |
|---|---|
| Porta 5432 em uso | Pare outra instância do PostgreSQL ou altere a porta no `docker-compose.yml` |
| Porta 3333 em uso | Verifique: `lsof -i :3333` |
| Erro de conexão com banco | Verifique se o container está rodando: `docker compose ps` |
| "GEMINI_API_KEY is required" | Confirme que o `.env` do server tem a chave preenchida |

---

## Licença

Projeto desenvolvido para fins de estudo durante o NLW da Rocketseat.
