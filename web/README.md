# NLW Agents - Frontend

Interface web com React 19 para criar salas, gravar áudio e fazer perguntas respondidas por IA.

> Para visão geral do projeto, setup e conceitos aprendidos, veja o [README principal](../README.md).

## Arquitetura

```
src/
├── pages/
│   ├── create-room.tsx         # / — criar sala + listar salas
│   ├── room.tsx                # /room/:roomId — perguntas e respostas
│   └── record-room-audio.tsx   # /room/:roomId/audio — gravação de áudio
├── components/
│   ├── ui/                     # Componentes shadcn/ui (Button, Input, Label)
│   ├── create-room-form.tsx    # Formulário de criação de sala
│   ├── question-form.tsx       # Formulário de pergunta
│   ├── question-item.tsx       # Exibe pergunta + resposta da IA
│   ├── question-list.tsx       # Lista de perguntas da sala
│   └── room-list.tsx           # Lista de salas recentes
├── http/
│   ├── api.ts                  # URL base da API
│   ├── types/                  # Tipos de request/response
│   ├── use-rooms.ts            # Query: listar salas
│   ├── use-create-room.ts      # Mutation: criar sala
│   ├── use-room-questions.ts   # Query: perguntas da sala
│   └── use-create-question.ts  # Mutation: enviar pergunta
├── lib/
│   ├── utils.ts                # cn() para merge de classes CSS
│   └── dayjs.ts                # Configuração do dayjs (pt-br, relativeTime)
├── __tests__/                  # Testes (Jest + Testing Library)
├── app.tsx                     # Rotas + QueryClientProvider
├── main.tsx                    # Entry point (React DOM)
└── index.css                   # Estilos globais (Tailwind)
```

## Páginas

| Rota | Página | Funcionalidade |
|---|---|---|
| `/` | CreateRoom | Criar salas + listar salas recentes |
| `/room/:roomId` | Room | Fazer perguntas e ver respostas da IA |
| `/room/:roomId/audio` | RecordRoomAudio | Gravar áudio (chunks de 5s, auto-upload) |

## Hooks de API

Todos os hooks usam **TanStack React Query** para cache e sincronização:

- `useRooms()` — lista salas com contagem de perguntas
- `useCreateRoom()` — cria sala e invalida cache da lista
- `useRoomQuestions(roomId)` — lista perguntas com respostas
- `useCreateQuestion(roomId)` — envia pergunta com optimistic update

## Estilização

- **Tailwind CSS 4** com tema escuro (bg-zinc-950)
- **shadcn/ui** — componentes acessíveis baseados em Radix UI
- **cn()** — utilitário para merge dinâmico de classes (`clsx` + `tailwind-merge`)

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Dev server (Vite) |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm test` | Testes unitários |
| `npm run test:coverage` | Testes com relatório de cobertura (min 60%) |
| `npm run lint` | Biome (lint + format) |
