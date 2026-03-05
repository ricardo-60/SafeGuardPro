# SafeGuard Pro - Sistema de Gestão de Segurança

Sistema robusto de gestão para empresas de segurança privada, com suporte a operações offline, sincronização automática (Offline-First) e integração com IA Gemini para relatórios executivos.

## 🚀 Stack Tecnológica

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend (BaaS):** Supabase (Postgres, Auth, Realtime).
- **Backend (Local/Edge):** Express, SQLite (better-sqlite3) para persistência em desktop.
- **Desktop:** Electron + Electron Builder.
- **IA:** Google Gemini SDK (@google/genai).
- **Testes:** Vitest + React Testing Library + Playwright.

## 🛠️ Configuração Inicial

### Pré-requisitos

- Node.js (Recomendado v20 LTS ou superior)
- Git

### 1. Instalação

Clone o repositório e instale as dependências:

```bash
npm install
```

### 2. Variáveis de Ambiente

Crie um ficheiro `.env` na raiz do projeto baseado no `.env.example`:

```env
GEMINI_API_KEY="sua_chave_gemini"
VITE_SUPABASE_URL="seu_url_supabase"
VITE_SUPABASE_ANON_KEY="sua_chave_anon_supabase"
```

### 3. Execução em Desenvolvimento

Para rodar a aplicação web com o servidor Express (que inclui o middleware Vite):

```bash
npm run dev
```

Para rodar em ambiente Electron (Desktop) em modo dev:

```bash
npm run dev:electron
```

## 🧪 Testes e Qualidade

O projeto utiliza **Vitest** para garantir a integridade da lógica de negócio e da fila offline.

```bash
# Executar suite de testes unitários
npm run test

# Executar testes com relatório de cobertura
npm run test:coverage
```

## 📦 Build e Deploy

### Compilação Desktop (Windows)

```bash
npm run build:electron
```

O instalador será gerado na pasta `dist-electron`.

### Deploy Web (Vercel/Cloud Run)

O projeto está configurado para deploy automático via Vercel ou através do build de produção:

```bash
npm run build
```

---
**SafeGuard Pro** - Estabilidade e Segurança em Primeiro Lugar.
