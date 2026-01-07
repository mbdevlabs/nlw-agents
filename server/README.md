# NLW Agents - Backend (Server)

API REST desenvolvida com Fastify para o sistema NLW Agents, com integração de IA (Google Gemini) para transcrição de áudio e geração de respostas contextualizadas usando RAG (Retrieval-Augmented Generation).

## Tecnologias

- **Runtime:** Node.js 22+ (usa `--experimental-strip-types`)
- **Framework:** Fastify v5.4.0
- **Linguagem:** TypeScript
- **ORM:** Drizzle ORM
- **Banco de Dados:** PostgreSQL com pgvector
- **IA:** Google Gemini (transcrição e embeddings)
- **Validação:** Zod
- **Testes:** Jest
- **Linting:** Biome

## Arquitetura

```
server/
├── src/
│   ├── db/
│   │   ├── connections.ts    # Conexão com PostgreSQL
│   │   ├── schema/           # Schemas Drizzle (rooms, questions, audio_chunks)
│   │   ├── migrations/       # Migrations do banco
│   │   └── seed.ts           # Dados de teste
│   ├── http/
│   │   └── routes/           # Rotas da API
│   ├── services/
│   │   └── gemini.ts         # Integração com Google Gemini
│   ├── env.ts                # Validação de env vars
│   └── server.ts             # Entrypoint
│   └── __tests__/            # Testes unitários
├── docker/
│   └── setup.sql             # Script inicial do PostgreSQL
└── docker-compose.yml        # PostgreSQL + pgvector
```

## Pré-requisitos

- Node.js 22+
- Docker e Docker Compose
- Chave de API do Google Gemini

## Configuração

1. Clone o repositório e navegue até a pasta server
2. Copie o arquivo de ambiente:
   ```bash
   cp .env.example .env
   ```
3. Configure as variáveis:
   ```env
   PORT=3333
   DATABASE_URL=postgresql://docker:docker@localhost:5432/agents
   GEMINI_API_KEY=sua_chave_gemini
   ```

## Instalação

```bash
# Instalar dependências
npm install

# Subir o banco de dados
docker-compose up -d

# Executar migrations
npm run db:migrate

# (Opcional) Popular com dados de teste
npm run db:seed
```

## Executando

```bash
# Desenvolvimento (hot reload)
npm run dev

# Produção
npm start
```

## API Endpoints

### Health Check
```
GET /health
Response: "OK"
```

### Rooms

#### Listar Salas
```http
GET /rooms

Response: [
  {
    "id": "uuid",
    "name": "Nome da Sala",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "questionsCount": 5
  }
]
```

#### Criar Sala
```http
POST /rooms
Content-Type: application/json

{
  "name": "Nome da Sala",
  "description": "Descrição opcional"
}

Response: { "roomId": "uuid" }
```

### Questions

#### Listar Perguntas de uma Sala
```http
GET /rooms/:roomId/questions

Response: [
  {
    "id": "uuid",
    "question": "Pergunta?",
    "answer": "Resposta da IA",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Criar Pergunta (com resposta IA)
```http
POST /rooms/:roomId/questions
Content-Type: application/json

{
  "question": "Sua pergunta aqui?"
}

Response: {
  "questionId": "uuid",
  "answer": "Resposta gerada pela IA"
}
```

### Audio

#### Upload de Áudio (com transcrição)
```http
POST /rooms/:roomId/audio
Content-Type: multipart/form-data

Body: audio file (webm)

Response: { "chunkId": "uuid" }
```

## Testes

```bash
# Executar todos os testes
npm test

# Watch mode
npm run test:watch

# Com coverage
npm run test:coverage
```

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento (hot reload) |
| `npm start` | Inicia em produção |
| `npm run db:generate` | Gera migrations |
| `npm run db:migrate` | Executa migrations |
| `npm run db:seed` | Popula banco com dados de teste |
| `npm test` | Executa testes |
| `npm run test:coverage` | Executa testes com coverage |

## Banco de Dados

### Schema

**rooms**
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Primary key |
| name | TEXT | Nome da sala |
| description | TEXT | Descrição opcional |
| createdAt | TIMESTAMP | Data de criação |

**questions**
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Primary key |
| roomId | UUID | FK para rooms |
| question | TEXT | Pergunta do usuário |
| answer | TEXT | Resposta da IA |
| createdAt | TIMESTAMP | Data de criação |

**audio_chunks**
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Primary key |
| roomId | UUID | FK para rooms |
| transcription | TEXT | Transcrição do áudio |
| embeddings | VECTOR(768) | Embeddings para busca semântica |
| createdAt | TIMESTAMP | Data de criação |

## Fluxo de Funcionamento

1. Usuário grava áudio na sala
2. Áudio é enviado para `/rooms/:roomId/audio`
3. Gemini transcreve o áudio
4. Embeddings são gerados e salvos com pgvector
5. Usuário faz pergunta
6. Sistema busca chunks similares via similaridade de cosseno (threshold: 0.7)
7. Gemini gera resposta baseada no contexto encontrado
