# NLW Agents - Backend

API REST com Fastify + Google Gemini para transcrição de áudio e respostas via RAG.

> Para visão geral do projeto, setup e conceitos aprendidos, veja o [README principal](../README.md).

## Arquitetura

```
src/
├── server.ts              # Entrypoint (Fastify + CORS + plugins)
├── env.ts                 # Validação de env vars (Zod)
├── http/routes/
│   ├── get-rooms.ts       # GET /rooms
│   ├── create-room.ts     # POST /rooms
│   ├── get-room-questions.ts # GET /rooms/:roomId/questions
│   ├── create-question.ts # POST /rooms/:roomId/questions (RAG)
│   └── upload-audio.ts    # POST /rooms/:roomId/audio (transcrição)
├── services/
│   └── gemini.ts          # Google Gemini (transcrição, embeddings, geração)
├── db/
│   ├── connections.ts     # Drizzle ORM + PostgreSQL client
│   ├── schema/            # rooms, questions, audio_chunks
│   ├── migrations/        # Geradas pelo drizzle-kit
│   └── seed.ts            # Dados de teste
└── __tests__/             # Testes unitários (Jest)
```

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/rooms` | Lista salas + contagem de perguntas |
| `POST` | `/rooms` | Cria sala (`{ name, description? }`) |
| `GET` | `/rooms/:roomId/questions` | Lista perguntas e respostas |
| `POST` | `/rooms/:roomId/questions` | Pergunta com resposta RAG (`{ question }`) |
| `POST` | `/rooms/:roomId/audio` | Upload de áudio multipart (transcrição + embeddings) |

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor em modo desenvolvimento |
| `npm start` | Servidor em produção |
| `npm run db:generate` | Gera migrations (drizzle-kit) |
| `npm run db:migrate` | Executa migrations |
| `npm run db:seed` | Popula banco com dados de teste |
| `npm test` | Testes unitários |
| `npm run test:coverage` | Testes com relatório de cobertura (min 70%) |
| `npm run lint` | Biome (lint + format) |

## Banco de Dados

Schema gerenciado pelo Drizzle ORM com 3 tabelas:

- **rooms** — salas de aula (id, name, description)
- **questions** — perguntas com respostas da IA (question, answer)
- **audio_chunks** — transcrições com embeddings vetoriais `VECTOR(768)` para busca semântica

Busca por similaridade cosseno (`<=>`) com threshold 0.7, retornando os 3 chunks mais relevantes.
