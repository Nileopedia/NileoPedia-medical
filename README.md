# NileoPedia-medical

AI-powered medical knowledge platform using RAG, GPT-4o, Pinecone, and Elasticsearch to deliver evidence-based, source-grounded clinical information with citation-backed responses.

## 🏗️ Architecture

```
Frontend (React/Vite) → Backend API (Express) → AI Orchestration Layer → RAG Pipeline → Pinecone + Elasticsearch → GPT-4o → Validated Medical Response
```

## 📁 Monorepo Structure

```
NileoPedia/
├── apps/
│   ├── frontend/                 # Next.js Frontend
│   ├── backend/                  # Express Backend API
│   └── ai-services/              # Python AI/RAG Services
├── packages/                     # Shared packages
├── infrastructure/              # Docker, Terraform, Kubernetes
├── docs/                        # Documentation
├── scripts/                     # Setup and migration scripts
└── .github/workflows/           # CI/CD pipelines
```

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Start infrastructure
pnpm docker:up
```

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite, Tailwind CSS
- **Backend**: Express, TypeScript, PostgreSQL, Prisma
- **AI Services**: Python, FastAPI, LangChain
- **Infrastructure**: Docker, PostgreSQL, Elasticsearch, Pinecone

## 📦 Development Commands

```bash
pnpm build       # Build all apps
pnpm dev         # Start development servers
pnpm lint        # Run linting
pnpm test        # Run tests
pnpm docker:up   # Start Docker containers
pnpm docker:down # Stop Docker containers
```