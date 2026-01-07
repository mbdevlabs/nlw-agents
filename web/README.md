# NLW Agents - Frontend (Web)

Interface web desenvolvida com React 19 para o sistema NLW Agents, permitindo criar salas, gravar áudio e fazer perguntas respondidas por IA.

## Tecnologias

- **Framework:** React 19
- **Build Tool:** Vite 7
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS 4 + shadcn/ui
- **State Management:** TanStack React Query
- **Formulários:** React Hook Form + Zod
- **Roteamento:** React Router DOM v7
- **Testes:** Jest + Testing Library
- **Linting:** Biome

## Arquitetura

```
web/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes shadcn/ui
│   │   ├── create-room-form.tsx
│   │   ├── question-form.tsx
│   │   ├── question-item.tsx
│   │   ├── question-list.tsx
│   │   └── room-list.tsx
│   ├── http/
│   │   ├── types/           # Tipos de request/response
│   │   ├── use-rooms.ts
│   │   ├── use-create-room.ts
│   │   ├── use-room-questions.ts
│   │   └── use-create-question.ts
│   ├── lib/
│   │   ├── utils.ts         # Utilitários (cn, etc)
│   │   └── dayjs.ts         # Configuração dayjs
│   ├── pages/
│   │   ├── create-room.tsx
│   │   ├── room.tsx
│   │   └── record-room-audio.tsx
│   ├── __tests__/           # Testes unitários
│   ├── app.tsx              # Rotas e providers
│   ├── main.tsx             # Entrypoint
│   └── index.css            # Estilos globais
└── index.html
```

## Pré-requisitos

- Node.js 20+
- Backend rodando em localhost:3333

## Instalação

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build produção
npm run build

# Preview do build
npm run preview
```

## Páginas

### / (Create Room)
- Formulário para criar novas salas
- Lista de salas recentes com contagem de perguntas

### /room/:roomId
- Formulário para fazer perguntas
- Lista de perguntas e respostas da IA
- Link para gravação de áudio

### /room/:roomId/audio
- Interface para gravação de áudio
- Envia chunks de 5 segundos automaticamente
- Áudio é transcrito e indexado para busca semântica

## Componentes Principais

### CreateRoomForm
Formulário para criação de salas com validação Zod.

**Validação:**
- `name`: mínimo 3 caracteres
- `description`: opcional

### QuestionForm
Formulário para envio de perguntas.

**Props:**
- `roomId: string` - ID da sala

**Validação:**
- `question`: mínimo 10, máximo 500 caracteres

### QuestionItem
Exibe uma pergunta e sua resposta.

**Props:**
```typescript
interface Question {
  id: string
  question: string
  answer: string | null
  createdAt: string
  isGeneratingAnswer?: boolean
}
```

### RoomList
Lista as salas disponíveis com links para acesso.

### QuestionList
Lista perguntas de uma sala específica.

**Props:**
- `roomId: string` - ID da sala

## Hooks Customizados

### useRooms()
Busca lista de salas.
```typescript
const { data, isLoading, error } = useRooms()
```

### useCreateRoom()
Mutation para criar sala.
```typescript
const { mutateAsync } = useCreateRoom()
await mutateAsync({ name: 'Sala', description: 'Desc' })
```

### useRoomQuestions(roomId)
Busca perguntas de uma sala.
```typescript
const { data } = useRoomQuestions('room-id')
```

### useCreateQuestion(roomId)
Mutation para criar pergunta com optimistic update.
```typescript
const { mutateAsync } = useCreateQuestion('room-id')
await mutateAsync({ question: 'Pergunta?' })
```

## Testes

```bash
# Executar testes
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm test` | Executar testes |
| `npm run test:coverage` | Testes com coverage |

## Estilização

O projeto usa Tailwind CSS 4 com a configuração do shadcn/ui. Os componentes base estão em `/src/components/ui/`.

### Tema
- Modo escuro por padrão (bg-zinc-950)
- Cores customizadas via CSS variables

### Classes Utilitárias
Usa `cn()` do `/src/lib/utils.ts` para merge de classes:
```typescript
import { cn } from '@/lib/utils'
cn('base-class', conditional && 'conditional-class')
```

## Configuração de Ambiente

Para produção, crie um arquivo `.env`:
```env
VITE_API_URL=https://sua-api.com
```

Os hooks em `/src/http/` podem ser modificados para usar esta variável.
