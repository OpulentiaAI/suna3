# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Suna is an open-source generalist AI agent platform that helps users accomplish real-world tasks through natural conversation. It's a monorepo with three main components:
- **Backend API**: Python/FastAPI service handling agent orchestration, LLM interactions, and business logic
- **Frontend**: Next.js/React application providing the user interface
- **Agent Docker**: Isolated execution environment for running agent tools safely

## Common Development Commands

### Backend Development
```bash
# Using Docker (recommended for full stack)
docker-compose up                                    # Start all services
docker-compose -f docker-compose.prod.yml up        # Production mode

# Local development (backend only)
cd backend
poetry install                                       # Install dependencies
poetry run uvicorn api:app --reload --port 8000    # Run API server

# Running tests
poetry run pytest                                    # Run all tests
poetry run pytest tests/test_specific.py           # Run specific test file

# Database operations
poetry run prisma generate                          # Generate Prisma client
poetry run prisma db push                          # Push schema to database
```

### Frontend Development
```bash
cd frontend
npm install                                         # Install dependencies
npm run dev                                        # Start development server
npm run build                                      # Build for production
npm run lint                                       # Run ESLint
npm run format                                     # Format code with Prettier
npm run format:check                               # Check formatting
```

### Working with Feature Flags
```bash
cd backend/flags
python setup.py --set-flag custom_agents true     # Enable feature
python setup.py --set-flag custom_agents false    # Disable feature
python setup.py --list-flags                      # List all flags
```

## High-Level Architecture

### Backend Architecture (`/backend/`)

The backend follows a service-oriented architecture:

1. **API Layer** (`api.py`): FastAPI application with CORS, rate limiting, and lifecycle management
2. **Agent System** (`/agent/` and `/agentpress/`):
   - `ThreadManager`: Manages conversation threads and message persistence
   - `ToolRegistry`: Dynamic tool registration and execution
   - `ResponseProcessor`: Parses LLM responses and orchestrates tool calls
   - `ContextManager`: Handles conversation context and token limits
3. **Services** (`/services/`):
   - `llm.py`: Unified interface for multiple LLM providers via LiteLLM
   - `supabase.py`: Database operations and authentication
   - `redis.py`: Caching and session management
   - `billing.py`: Usage tracking and subscription management
   - `mcp_*.py`: Model Context Protocol integrations
4. **Agent Tools** (`/agent/tools/`):
   - Each tool follows a standard interface with `init()` and `execute()` methods
   - Tools include: browser automation, shell commands, file operations, web search, deployment, and data providers

### Frontend Architecture (`/frontend/`)

React/Next.js application with:

1. **Pages**: App router with nested layouts for dashboard, agent builder, chat interface
2. **Components**: Modular UI components with TypeScript interfaces
3. **State Management**: React Query for server state, Zustand for client state
4. **Authentication**: Supabase client integration with protected routes
5. **File Renderers**: Specialized components for displaying code, markdown, images, PDFs

### Key Integration Points

1. **LLM Communication**: The system streams responses using Server-Sent Events (SSE) between frontend and backend
2. **Tool Execution**: Tools are executed in isolated Docker containers with results streamed back
3. **Database**: Supabase PostgreSQL with Row Level Security for multi-tenancy
4. **Caching**: Redis for session management and feature flags
5. **Message Queue**: RabbitMQ with Dramatiq for background job processing

### Important Patterns

1. **Error Handling**: All services use try-catch with detailed logging to Sentry
2. **Authentication**: JWT tokens managed by Supabase, validated on each API request
3. **Context Management**: Conversation history is managed to stay within LLM token limits
4. **Tool Safety**: All tool executions happen in sandboxed environments
5. **Streaming**: Real-time updates use SSE for chat responses and tool outputs

## Environment Configuration

Essential environment variables:

### Backend (.env)
- **Database**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Cache/Queue**: `REDIS_HOST`, `REDIS_PORT`, `RABBITMQ_HOST`
- **LLM Keys**: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, etc.
- **Services**: `TAVILY_API_KEY`, `FIRECRAWL_API_KEY`, `DAYTONA_API_KEY`

### Frontend (.env)
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_BACKEND_URL` (defaults to http://localhost:8000)
- `NEXT_PUBLIC_ENV_MODE` (LOCAL/staging/production)

## Testing Strategy

- **Backend**: Uses pytest with fixtures for database and service mocking
- **Frontend**: Component testing with React Testing Library
- **E2E**: Playwright tests for critical user flows
- **Load Testing**: Locust scripts for API performance testing

Run tests before committing changes to ensure system stability.