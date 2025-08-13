# NLW Agents

Aplicação fullstack desenvolvida durante o evento **NLW** da [Rocketseat](https://www.rocketseat.com.br/).  
O projeto é composto por **backend** e **frontend** integrados, oferecendo uma base sólida para aprendizado e evolução de aplicações modernas.

---

## 📦 Tecnologias Utilizadas

### **Backend**

- **Node.js**
- **TypeScript**
- **Fastify** – Framework web focado em alta performance
- **@fastify/cors** – Middleware para habilitar CORS
- **fastify-type-provider-zod** – Integração de validação e tipagem com Zod
- **Zod** – Validação de esquemas e tipos
- **Drizzle ORM** – Manipulação de banco de dados SQL
- **Docker** – Ambiente de banco de dados e dependências

### **Frontend**

- 🚀 **React 19** – Construção da interface
- ⚡ **Vite** – Bundler e servidor de desenvolvimento rápido
- 🟦 **TypeScript** – Tipagem estática para JavaScript
- 🛣️ **React Router DOM** – Gerenciamento de rotas
- 🔄 **@tanstack/react-query** – Gerenciamento de dados assíncronos
- 🎨 **TailwindCSS** – Estilização rápida com utilitários
- 🧩 **class-variance-authority**, **clsx**, **tailwind-merge** – Composição de classes CSS
- 🖼️ **lucide-react** – Ícones SVG
- 🧱 **@radix-ui/react-slot** – Componentes acessíveis
- 🧹 **ESLint**, **Biome** – Linting e formatação de código

---

## 📂 Padrão de Projeto

### Backend

- Estrutura modular baseada em rotas, controllers e schemas
- Validação de dados com **Zod**
- Organização em pastas:
  - `src/http/routes`
  - `src/db`
  - `src/schema`

### Frontend

- Estrutura baseada em **componentes funcionais**
- Organização por **páginas** (`src/pages`) e **componentes reutilizáveis** (`src/components`)
- Hooks para gerenciamento de estado e efeitos
- CSS utilitário com **Tailwind** e customizações via `src/index.css`

---

## ⚙️ Setup e Configuração

### Backend

1. **Clone o repositório:**
   ```sh
   git clone <https://github.com/mbdevlabs/nlw-agents/server>
   cd server
   ```
2. **Instale as dependências:**
   ```sh
   npm install
   ```
3. **Configure as variáveis de ambiente:**

   - Edite o arquivo `.env` conforme necessário (veja `src/env.ts`).

4. **Suba o banco de dados com Docker:**
   ```sh
   docker-compose up -d
   ```
5. **Execute as migrations:**
   ```sh
   npm run migrate
   ```
6. **Inicie o servidor:**
   ```sh
   npm run dev
   ```

## Endpoints

- `GET /rooms` — Lista todas as salas.
- `GET /health` — Health check da API.

### Front

1. **Clone o repositório:**

   ```sh
   git clone <https://github.com/mbdevlabs/nlw-agents/web>
   cd web
   ```

1. **Instale as dependências:**

   ```bash
   npm install
   ```

1. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm run dev
   ```

1. **Build para produção:**

   ```bash
   npm run build
   ```
