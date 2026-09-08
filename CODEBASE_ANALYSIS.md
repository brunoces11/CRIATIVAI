# CriativAI - Análise Abrangente da Codebase

**Data**: 4 de agosto de 2026  
**Status**: Mapeamento Completo Concluído  
**Ambiente**: Windows (cmd shell)

---

## 📌 VISÃO GERAL DO SISTEMA

### Propósito do Produto

CriativAI é um **site da agência com sistema integrado de atendimento com IA**. A aplicação funciona como:

1. **Site de apresentação** das soluções de automação e desenvolvimento digital da agência
2. **Sistema de qualificação de leads** com agente IA em tempo real
3. **Plataforma de agendamento automático** com integração Google Calendar
4. **Motor de geração de briefings** para capturar especificações de projetos
5. **Dashboard admin** (protegido) para visualizar conversas e leads

### Fluxo Principal do Usuário

1. **Visitante acessa site** → Vê apresentação de serviços
2. **Clica em "Conversar"** → Chat widget abre com agente IA
3. **Agente qualifica** → Captura contexto, necessidade, timezone do visitante
4. **Agente oferece** → Três caminhos:
   - **Agendamento**: Consulta Google Calendar, oferece slots, cria evento confirmado
   - **Briefing**: Faz 5-7 perguntas estruturadas, compila em Markdown, envia por email
   - **Contato**: Captura dados para follow-up posterior
5. **Email confirmado** → Visitante recebe briefing/confirmação
6. **Admin notificado** → Bruno recebe notificação de novo lead/agendamento

---

## 🏗️ ARQUITETURA GERAL

### Stack Tecnológico

| Camada | Tecnologia | Versão | Propósito |
|--------|-----------|--------|----------|
| **Frontend** | React 19 + TypeScript | 19.2.6 | UI componentes, chat interface |
| **Frontend Build** | Vite + React Plugin | 8.1.5 | Build, dev server, SPA routing |
| **Backend** | FastAPI | 0.124.4 | API HTTP, streaming NDJSON, event loop |
| **Runtime** | Uvicorn | 0.38.0 | ASGI server, WebSocket pronto |
| **Banco de Dados** | SQLite | WAL mode | Persistência local, migrations Alembic |
| **ORM** | SQLAlchemy 2.0 | 2.0.45 | Models, relationships, queries tipadas |
| **Migrations** | Alembic | 1.17.2 | Schema versioning, rollback |
| **AI/LLM** | OpenAI API | gpt-5-mini | Chat, tool calling, streaming |
| **Calendário** | Google Calendar API | v3 | Freebusy, events, CRUD |
| **Auth** | Google OAuth 2.0 + PKCE | 2.0 | Autorização para Google Calendar |
| **Email** | SMTP (Mailjet) | v3 | Notificações, confirmações |
| **Deployment** | Docker + FastAPI | Alpine | Production runtime candidate |

### Modo Frontend Only

O projeto suporta **dois modos de operação**:

- **Modo Full** (padrão): Frontend + FastAPI backend integrados
- **Modo Sites Frontend Only** (via `VITE_SITES_FRONTEND_ONLY=1`):
  - Apenas frontend estático é buildado
  - Chat widget abre email fallback
  - Admin page redireciona para video
  - Reduz dependency para deployments puramente estáticos

---

## 📂 ESTRUTURA DE DIRETÓRIOS

```
CRIATIVAI/
├── backend/                          # FastAPI runtime + lógica de negócio
│   ├── app/                          # Módulos de aplicação
│   │   ├── main.py                   # FastAPI app, routers, SPA fallback
│   │   ├── db.py                     # SQLAlchemy engine, session factory
│   │   ├── models.py                 # Todas as entidades (10 models)
│   │   ├── config.py                 # Pydantic Settings, validação
│   │   ├── schemas.py                # Request/response models (Pydantic)
│   │   │
│   │   ├── chat.py                   # Orquestração do chat, rate limiting
│   │   ├── openai_chat.py            # Integração OpenAI, tool calling loop
│   │   ├── chat_tracing.py           # Rastreamento de turno (debug log)
│   │   ├── chat_multi_window.py      # Multi-janela de chat (feature flag)
│   │   ├── chat_welcome.py           # Mensagens de boas-vindas (por CTA)
│   │   │
│   │   ├── calendar_tools.py         # Definição das 7 tools (Pydantic schemas)
│   │   ├── calendar_availability.py  # calendar_check_availability logic
│   │   ├── calendar_booking.py       # CRUD de bookings, Google Calendar sync
│   │   ├── calendar_notifications.py # Email de notificação de agendamentos
│   │   │
│   │   ├── forms.py                  # Form endpoints (contact, talent-preview)
│   │   ├── emailer.py                # SMTP wrapper, template rendering
│   │   ├── google_oauth.py           # OAuth flow, token refresh, redirect
│   │   ├── project_briefings.py      # Briefing CRUD, email composition
│   │   ├── admin.py                  # Admin endpoints (read-only views)
│   │   ├── admin_records.py          # Índice unificado de contacts
│   │   │
│   │   └── prompts/
│   │       └── sdr_default.md        # System prompt do agente (português)
│   │
│   ├── alembic/                      # Database migrations (8 versões)
│   │   ├── env.py                    # Alembic config
│   │   ├── versions/                 # Migration scripts
│   │   │   ├── 0001_initial_vertical_schema.py
│   │   │   ├── 0002_chat_turn_security.py
│   │   │   ├── ...
│   │   │   └── 0008_admin_records.py # Última migração
│   │   └── script.py.mako            # Template de migration
│   │
│   ├── tests/                        # Testes backend
│   │   ├── test_chat.py
│   │   ├── test_forms.py
│   │   ├── test_calendar_*.py
│   │   └── test_openai_*.py
│   │
│   ├── requirements.txt              # Dependências produção
│   ├── requirements-dev.txt          # Dependências dev
│   ├── alembic.ini                   # Config do Alembic
│   └── README.md                     # Instruções backend
│
├── src/                              # React + TypeScript frontend
│   ├── pages/                        # 12 páginas (route-based)
│   │   ├── Home.tsx
│   │   ├── Video.tsx
│   │   ├── Services.tsx
│   │   ├── HumanResources.tsx
│   │   ├── TalentPreview.tsx
│   │   ├── AboutMe.tsx
│   │   ├── HireMe.tsx
│   │   ├── Contact.tsx
│   │   ├── PrivacyTerms.tsx
│   │   ├── StyleGuide.tsx
│   │   ├── Admin.tsx
│   │   └── ToolFunc.tsx              # Nova página (mapa de tools)
│   │
│   ├── components/                   # Componentes reutilizáveis
│   │   ├── ChatWidget.tsx            # Chat UI + streaming
│   │   ├── SiteHeader.tsx            # Header com nav
│   │   ├── FormSuccessModal.tsx      # Modal de sucesso
│   │   ├── MarkdownText.tsx          # Renderização Markdown
│   │   ├── AdminRecordModal.tsx      # Modal admin
│   │   ├── ServiceCatalogCard.tsx    # Card de serviço
│   │   ├── RecruitmentAiConsole.tsx  # Console para recrutadores
│   │   └── target-mode/              # Componente feature flag
│   │
│   ├── lib/                          # Utilitários
│   │   ├── chatContext.ts            # Custom events para chat
│   │   ├── chatStream.ts             # Parser NDJSON, fetch wrappers
│   │   ├── forms.ts                  # Form submission helpers
│   │   └── sitesRuntime.ts           # Modo sites frontend only
│   │
│   ├── data/                         # (Empty, future content)
│   │
│   ├── App.tsx                       # Router principal (pathname-based)
│   ├── main.tsx                      # React entry point
│   ├── styles.css                    # Global styles
│   └── vite-env.d.ts                 # Vite type definitions
│
├── public/                           # Static assets (images, videos)
│   ├── icons/
│   └── project-visuals/
│
├── dist/                             # Built frontend (npm run build)
│   ├── index.html
│   ├── assets/
│   └── (images, videos)
│
├── data/                             # SQLite databases (runtime)
│   ├── app.db                        # Production database
│   ├── vertical-debug.db             # Debug database
│   └── vertical-test.db              # Test database
│
├── scripts/                          # Build & dev scripts
│   ├── dev.mjs                       # npm run dev orchestrator
│   ├── backend.mjs                   # npm run backend launcher
│   ├── runtime.mjs                   # Python virtual env finder
│   └── build-sites.mjs               # Sites-only build
│
├── tests/                            # Frontend & vertical tests
│   ├── rendered-html.test.mjs        # SPA route rendering
│   ├── chat-stream-parser.test.mjs   # NDJSON parser
│   ├── backend-tests.mjs             # Backend endpoint tests
│   └── backend-vertical.test.mjs     # Full vertical integration
│
├── worker/                           # Cloudflare Workers integration (stub)
│   └── cf-entry.ts
│
├── vite.config.ts                    # Vite configuration (auto backend)
├── tsconfig.json                     # TypeScript config
├── package.json                      # npm scripts, dependencies
├── index.html                        # SPA entry point
├── Dockerfile.deploy                 # Production image
├── deploy.env                        # Deployment metadata
├── .env.example                      # Environment template
├── .gitignore
├── README.md                         # Main documentation
├── mapa_toolfunc.md                  # Tools & functions reference
└── CODEBASE_ANALYSIS.md             # Este arquivo
```

---

## 🗄️ BANCO DE DADOS

### Schema: 10 Entidades

#### 1. **Conversation**
- Centro da aplicação
- Representa uma sessão de visitante
- Fields: session_id, visitor_name, visitor_email, visitor_company, timezone, language, summary, status, timestamps
- Relationships: 1 → N Messages, 1 → N ProjectBriefings

#### 2. **Message**
- Turno individual no chat
- Fields: role (user/assistant), content, status, turn_id, metadata_json
- Constraint: (conversation_id, turn_id, role) único
- Relationships: N → 1 Conversation

#### 3. **Booking**
- Agendamento confirmado no Google Calendar
- Fields: google_event_id, participant_name/email, starts_at_utc, timezone, status, idempotency_key
- Status valores: pending, confirmed, cancelled
- Relationships: N → 1 Conversation (opcional)

#### 4. **ProjectBriefing**
- Briefing de projeto enviado por email
- Fields: briefing_title, briefing_markdown, status, idempotency_key
- Email tracking: owner_email_status, client_email_status
- Relationships: N → 1 Conversation

#### 5. **ContactSubmission**
- Formulário de contato simples
- Fields: name, email, subject, message, status, source_ip, user_agent
- Email tracking: notification_email_status
- Standalone (não ligado a Conversation)

#### 6. **TalentPreviewRequest**
- Formulário de busca de talentos
- Fields: requester_*, job_title, search_criteria_[1-4], exclusion_criteria, differentiator
- Email tracking duplo
- Standalone

#### 7. **AdminRecord**
- **Índice unificado** de contacts
- Agrega: contacts, bookings, briefings, talent-preview requests
- Fields: user_from (source type), source_record_id, conversation_id
- Constraint: (user_from, source_record_id) único
- Propósito: Admin dashboard lista única

#### 8. **OAuthState**
- Segurança Google OAuth
- Fields: state (CSRF), code_verifier (PKCE), purpose, expires_at, used_at
- Lifecycle: 10 minutos (padrão)

#### 9. **Booking** (Google Calendar sync)
- (Descrito acima)

#### 10. **TalentPreviewRequest**
- (Descrito acima)

### Modo WAL (Write-Ahead Logging)

SQLite configurado em modo WAL para:
- Melhor concorrência (múltiplas connections simultâneas)
- Recuperação mais rápida de crashes
- Suporte a transações ACID robustas

### Migrations (Alembic)

8 migrações versionadas:

1. `0001_initial_vertical_schema` - Tabelas base
2. `0002_chat_turn_security` - Turn ID para segurança
3. `0003_form_submissions` - Contact + TalentPreview
4. `0004_oauth_pkce_code_verifier` - Google OAuth
5. `0005_booking_participant_details` - Booking schema
6. `0006_conversation_temporal_context` - Timezone tracking
7. `0007_project_briefings` - Briefing storage
8. `0008_admin_records` - Admin index (com data migration)

---

## 🤖 SISTEMA DE IA & TOOLS

### OpenAI Integration

**Model**: `gpt-5-mini` (configurável)  
**Streaming**: Respostas via `response.stream()` API  
**Tool Calling**: Funções estruturadas com Pydantic schemas

### 7 Tools Disponíveis

#### Calendar Tools (5)
1. `calendar_check_availability` - Consulta slots disponíveis
2. `calendar_create_event` - Cria evento + email notification
3. `calendar_lookup_bookings` - Busca eventos existentes
4. `calendar_update_event` - Remarca evento
5. `calendar_cancel_event` - Cancela evento

#### Contact & Briefing (2)
6. `chat_capture_contact` - Salva nome/email/empresa na conversa
7. `project_briefing_send_email` - Cria briefing + envia 2 emails

**Regra universal**: Todas as tools com efeito colateral exigem `confirmed=true`

### Prompt do Agente

**Arquivo**: `backend/app/prompts/sdr_default.md`

Instruções em **português brasileiro**:
- Persona: SDR (Sales Development Representative) da CriativAI
- Contexto: Oferece soluções de automação, desenvolvimento, briefing
- Calendário: Instructions específicas para regras de timezone, slots, confirmações
- Tools: Instruções de quando/como usar cada tool, validações

### Chat Loop com Tools

1. Usuário envia mensagem → Servidor
2. Validações (rate limit, length, duplicate check)
3. Construir histórico + nova mensagem → OpenAI
4. Stream de resposta (deltas + tool calls)
5. Se tool call:
   - Parse argumentos JSON
   - Validar com Pydantic schema
   - Executar tool (calendar/contact/briefing)
   - Tool retorna resultado
   - Tool result enviado de volta → OpenAI como nova mensagem
   - Loop até max_iterations (padrão 4)
6. Quando tool returns `stop` → Enviar deltas finais para client
7. Persister message na DB + conversation update

### Rate Limiting

- **Chat**: 8 mensagens por 60 segundos por sessão
- **Forms**: 3 submissões por 900 segundos por IP
- **Busy detection**: Bloqueia se já há resposta em progresso

---

## 📧 EMAIL & NOTIFICAÇÕES

### SMTP Configuration

- **Host**: Mailjet (in-v3.mailjet.com:587 padrão)
- **Auth**: Username/password via env vars
- **TLS**: STARTTLS (não SSL)
- **Sender**: Configurável (ex: "CriativAI <noreply@criativai.site>")

### Fluxos de Email

#### 1. Novo Agendamento
- **Para Bruno**: Notificação + dados do visitante + meeting summary
- **Cc**: Calendar notification email
- **Reply-To**: Email do visitante

#### 2. Briefing Enviado
- **Para Bruno**: Briefing completo + contexto
- **Para Cliente**: Confirmação de recebimento
- **Tracking**: Sucesso/falha persistido em db

#### 3. Formulário de Contato
- **Para Bruno**: Dados do form
- **Para Cliente**: Auto-confirmação (opcional)

#### 4. Formulário Talent Preview
- **Para Bruno**: Detalhes da busca
- **Para Cliente**: Confirmação

### Email Protection

- Honeypot field (hidden)
- Minimum fill time (4 segundos padrão)
- Session expiration (24 horas)
- Rate limiting per IP

---

## 🔐 SEGURANÇA

### Authentication & Authorization

- **Google OAuth**: PKCE flow (code verifier)
- **Admin panel** (/adm): Behind Traefik/nginx (não implementado em runtime)
- **API admin**: Read-only views
- **No user auth**: Chat é anônimo (session-based)

### Data Protection

- **Secrets**: Regex masking em logs (API keys, Bearer tokens)
- **Email masking**: Session IDs truncados (ex: "abc...xyz")
- **HTTPS enforcement**: Em produção (nginx/Traefik)
- **CORS**: Configurável por env (localhost devenv padrão)

### Rate Limiting

- Chat: 8 msgs/60s por session
- Forms: 3 submissions/900s por IP
- Google API: Built-in quota limits

### SQL Injection Prevention

- SQLAlchemy ORM (parameterized queries)
- Pydantic validation
- Field type enforcement

---

## 🚀 BUILD & DEPLOYMENT

### Local Development

```bash
npm install                   # Frontend deps
npm run build                # Frontend build (Vite)
python -m venv .venv        # Python venv
.venv\Scripts\python -m pip install -r backend\requirements-dev.txt
.venv\Scripts\python -m alembic -c backend\alembic.ini upgrade head
npm run dev                 # Start Vite + FastAPI auto
```

### Development Server (npm run dev)

- **Vite**: Localhost:5173 (HMR, dev server)
- **FastAPI**: Localhost:8000 (auto-started)
- **Proxy**: /api/* → FastAPI
- **SPA fallback**: Todas outras rotas → index.html

### Production Build

```bash
npm run build               # Frontend (Vite)
docker build -f Dockerfile.deploy -t criativai .
docker run --env-file .env -p 8000:8000 -v data:/app/data criativai
```

**Dockerfile.deploy**:
1. Node 22 Alpine → Build frontend
2. Python 3.12 Slim → FastAPI runtime
3. Alembic migrate on startup
4. Uvicorn single-worker (8000)

### Deployment Strategy

- **Platform**: Docker
- **Orchestration**: Traefik (reverse proxy)
- **Database**: SQLite com volumes (data:/app/data)
- **Secrets**: Env vars (.env file)
- **Certificates**: Let's Encrypt (Traefik)

---

## 📊 PRINCIPAIS FLUXOS

### Fluxo 1: Chat com Agendamento

```
1. Visitante entra no site
   ↓
2. Clica no widget de chat
   → Backend cria Conversation (session_id)
   → Welcome message enviada
   ↓
3. Visitante: "Quero agendar"
   ↓
4. Agente: "Qual seu timezone?"
   ↓
5. Visitante: "America/Sao_Paulo"
   → Persiste timezone na Conversation
   ↓
6. Agente chama: calendar_check_availability()
   → Google Calendar Freebusy query
   → Retorna 3 slots disponíveis
   ↓
7. Visitante escolhe slot
   ↓
8. Agente pede confirmação de email
   ↓
9. Visitante confirma email
   → chat_capture_contact() salva dados
   ↓
10. Agente: "Confirma agendamento para [data/hora]?"
    ↓
11. Visitante: "Sim, confirmo"
    ↓
12. Agente chama: calendar_create_event(confirmed=true)
    → Cria evento no Google Calendar
    → Salva booking na DB
    → Cria admin_records entry
    → Envia email a Bruno + cliente
    ↓
13. Sucesso! Visitante recebe confirmação
```

### Fluxo 2: Briefing Completo

```
1. Visitante no chat
   ↓
2. Agente faz 5-7 perguntas estruturadas
   ↓
3. Visitante responde
   ↓
4. Agente compila respostas em Markdown
   ↓
5. Agente mostra preview + pede confirmação
   ↓
6. Visitante: "Confirmo, enviar para meu email"
   ↓
7. Agente chama: chat_capture_contact(confirmed=true)
   → Salva visitor_name, visitor_email, visitor_company
   ↓
8. Agente chama: project_briefing_send_email(confirmed=true)
   → Cria ProjectBriefing record
   → Cria admin_records entry
   → Envia email a Bruno (completo)
   → Envia email a cliente (confirmação)
   ↓
9. Email tracking atualizado em DB
    ↓
10. Admin pode revisar em /adm/conversations
```

### Fluxo 3: Formulário de Contato

```
1. Visitante acessa /contact
   ↓
2. Preenche form (name, email, subject, message)
   → Honeypot hidden field
   → Timestamp started_at_ms
   ↓
3. Validação client-side (email, min lengths)
   ↓
4. Submit → POST /api/forms/contact
   ↓
5. Backend validação:
   - Rate limit por IP
   - Min fill time (4s)
   - Honeypot empty
   - Validação de dados (regex)
   ↓
6. Salva ContactSubmission
   ↓
7. Cria admin_records entry
   ↓
8. Envia email a Bruno
   ↓
9. Success modal mostrado
```

---

## 🧪 TESTES

### Frontend Tests

- **rendered-html.test.mjs**: Verifica que todas rotas renderizam
- **chat-stream-parser.test.mjs**: Parser NDJSON funciona corretamente

**Executar**: `npm test`

### Backend Tests

- **test_chat.py**: Chat streaming, rate limit, replay
- **test_openai_chat.py**: Mock OpenAI, tool calling
- **test_forms.py**: Form validation, SMTP mocking
- **test_calendar_*.py**: Calendar tool logic
- **test_google_oauth.py**: OAuth flow (mocked)

**Executar**: `npm run test:backend`

### Vertical Integration

- **backend-vertical.test.mjs**: Full stack
  - Inicia backend real em porta 8010
  - SQLite test database
  - Testa /api/chat endpoint com mock OpenAI
  - Verifica persistence em DB
  - Limpa ao terminar

**Executar**: `npm run test:vertical`

---

## ⚙️ CONFIGURAÇÃO

### Variáveis Críticas

**Development** (`.env` local):
- `OPENAI_API_KEY`: Chave da OpenAI
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: OAuth
- `SMTP_USERNAME`, `SMTP_PASSWORD`: Email
- `CORS_ORIGINS`: ["http://localhost:5173","http://127.0.0.1:8000"]

**Production** (.env runtime):
- `APP_ENV=production`
- Todas as acima + validações obrigatórias
- `OPENAI_MOCK_RESPONSE`: Deve estar vazio

### Feature Flags

1. **Chat Tracing**: `CHAT_TRACING_STATE_PATH` file
2. **Multi-window**: `CHAT_MULTI_WINDOW_STATE_PATH` file
3. **Sites Frontend Only**: `VITE_SITES_FRONTEND_ONLY=1` env

---

## 🚨 PONTOS SENSÍVEIS & RISCOS

### Alta Sensibilidade

1. **Google OAuth Token** (`data/google-token.json`)
   - Risco: Acesso não autorizado ao Google Calendar
   - Proteção: File permissions (read-only except FastAPI)
   - Mitigação: Refresh token logic em google_oauth.py

2. **OpenAI API Key**
   - Risco: Exposição = custo ilimitado
   - Proteção: Regex masking em logs
   - Mitigação: Env var, não em repo

3. **SMTP Credentials**
   - Risco: Spoof emails, reputation damage
   - Proteção: Env vars
   - Mitigação: Rate limiting, honeypot

4. **Database (SQLite)**
   - Risco: Dados pessoais, histórico conversas
   - Proteção: Backups, WAL mode
   - Mitigação: Acesso file system restrito

### Dependências Críticas

1. **Google Calendar API**
   - Downtime → Agendamento falha
   - Fallback: Agente pede email, envia email manualmente

2. **OpenAI API**
   - Downtime → Chat não funciona
   - Fallback: Mock response para teste

3. **Email (SMTP)**
   - Downtime → Notificações não chegam
   - Retry logic: Status tracking permite retry manual

### Inconsistências Identificadas

1. **Timezone handling**: Visitante browser timezone (client) vs Conversation timezone (capturada)
   - Risco: Slot oferecido em timezone diferente
   - Mitigação: Agente sempre confirma timezone verbalmente

2. **Admin records sync**: Criado em migrations + durante inserts
   - Risco: Duplicação se erro em migration
   - Mitigação: Unique constraint (user_from, source_record_id)

3. **Email template**
handling**: HTML/text templates are inline in Python (not separate files)
   - Risco: Difícil manutenção de templates longos
   - Mitigação: bem estruturados com clear markers

---

## 📋 ARQUIVOS CENTRAIS & RESPONSABILIDADE

| Arquivo | Responsabilidade | Criticidade |
|---------|-----------------|------------|
| `backend/app/main.py` | Router central, SPA fallback, health check | 🔴 Alta |
| `backend/app/models.py` | Schema ORM, 10 entidades | 🔴 Alta |
| `backend/app/chat.py` | Orquestração chat, rate limit, replay | 🔴 Alta |
| `backend/app/openai_chat.py` | Tool loop, streaming OpenAI | 🔴 Alta |
| `backend/app/calendar_tools.py` | Schemas + dispatch das 7 tools | 🔴 Alta |
| `backend/app/config.py` | Settings validation, env loading | 🟡 Média |
| `backend/app/forms.py` | Form endpoints, validation | 🟡 Média |
| `src/App.tsx` | Routing principal, SPA logic | 🟡 Média |
| `src/components/ChatWidget.tsx` | Chat UI, state, persistence | 🟡 Média |
| `src/lib/chatStream.ts` | NDJSON parser, fetch wrappers | 🟡 Média |
| `backend/app/google_oauth.py` | OAuth flow, token refresh | 🟡 Média |
| `backend/alembic/versions/` | Migrations, schema history | 🟢 Baixa (readonly) |

---

## 🎯 REGRAS & REQUISITOS IMPORTANTES

### Regras do Agente (System Prompt)

1. **Sempre em português** - Responde em PT-BR
2. **Confirmação obrigatória** - Agendamento, cancelamento, briefing
3. **Timezone validation** - Pede confirmação antes de sugerir slots
4. **Max 5 slots** - Por resposta (não enumera se >5)
5. **No secrets exposto** - Nunca retorna Google event IDs, tokens
6. **Safe tool handling** - Resume apenas customer-facing details

### Regras de Validação

1. **Email format**: RFC 5322 via regex
2. **Timezone IANA**: Via pytz validation
3. **Idempotency**: Keys 16-128 chars, única por recurso
4. **String lengths**: Limites rígidos em schemas (max_length)
5. **Boolean explicit**: `confirmed` deve ser literalmente `true`, não truthy

### Regras de Negócio

1. **Slot booking**: Não pode agendar sem slot oferecido previamente
2. **Aviso mínimo**: 24h para agendamento (configurável)
3. **Buffer**: 15 minutos entre eventos (configurável)
4. **Soft delete**: Cancelamentos marcam status, não deletam
5. **Email duplo**: Briefing SEMPRE envia a 2 destinatários

---

## 🔍 PADRÕES ARQUITETURAIS

### Backend

1. **Dependency Injection** (FastAPI)
   - `Depends(get_session)` para DB
   - `Depends(get_settings)` para config

2. **Pydantic Models**
   - `BaseModel` para schemas
   - `BaseSettings` para config
   - Field validation com regex, constraints

3. **SQLAlchemy 2.0**
   - Mapped types (Python 3.10+)
   - Relationships com backpopulate
   - Cascade delete rules

4. **Streaming**
   - NDJSON (newline-delimited JSON)
   - `StreamingResponse` com media_type
   - Parser async generator

### Frontend

1. **React Hooks**
   - `useState` para state local
   - `useEffect` para side effects
   - `useCallback` para memoization

2. **Lazy Loading**
   - `lazy()` + `Suspense` para route pages
   - Reduces bundle size

3. **Pathname-based Routing**
   - Não usa React Router
   - `window.location.pathname` para roteamento
   - SPA fallback em FastAPI

4. **Custom Events**
   - `CustomEvent` para chat trigger
   - Event listener cleanup em `useEffect`

---

## 📚 DOCUMENTAÇÃO EXISTENTE

1. **README.md** - Setup local, build, deploy
2. **backend/README.md** - Backend instruções
3. **mapa_toolfunc.md** - Tools & functions reference (gerado recentemente)
4. **deploy.env** - Metadata de último deploy
5. **.env.example** - Template de variáveis

---

## ✅ CHECKLIST PARA FUTURAS EDIÇÕES

### Antes de Modificar

- [ ] Ler `mapa_toolfunc.md` para entender tools
- [ ] Confirmar `/api` rotas em `main.py` e routers
- [ ] Check Pydantic schemas em `schemas.py` para request/response
- [ ] Verificar models ORM em `models.py` para relacionamentos
- [ ] Check `config.py` para variáveis esperadas
- [ ] Revisar prompts em `backend/app/prompts/sdr_default.md`

### Ao Editar Backend

- [ ] Executar `npm run test:backend` após changes
- [ ] Executar `npm run test:vertical` para integração
- [ ] Atualizar migrations se schema mudar
- [ ] Validar email templates renderizam corretamente
- [ ] Confirmar Google Calendar API calls ainda funcionam

### Ao Editar Frontend

- [ ] Confirmar routing em `App.tsx` está correto
- [ ] Check lazy loading imports estão OK
- [ ] Executar `npm run lint` (tsc --noEmit)
- [ ] Testar em modo sites frontend only (`VITE_SITES_FRONTEND_ONLY=1`)

### Deploy Considerations

- [ ] .env file com todos secrets
- [ ] DATABASE_URL válida (SQLite path ou PG string)
- [ ] OPENAI_API_KEY preenchida
- [ ] Google OAuth credentials set
- [ ] SMTP credentials set
- [ ] Rodar migrations: `alembic upgrade head`
- [ ] Test /api/health endpoint
- [ ] Backups do data/ directory

---

## 🧭 CONCLUSÃO

### Mapa de Compreensão Completo

O mapa foi construído com sucesso através de:

✅ Leitura completa de documentação (README, prompts, schemas)  
✅ Análise de modelos ORM e migrações de banco  
✅ Estudo do fluxo de chat e tool calling  
✅ Exploração de endpoints e rotas  
✅ Compreensão de Google Calendar e OAuth integrations  
✅ Mapeamento de formulários e persistência  
✅ Análise de frontend React e routing  
✅ Verificação de build pipeline e deployment  
✅ Identificação de testes e validações  

### Arquitetura Comprovada

A codebase implementa uma **arquitetura coesa SPA + FastAPI** com:

- ✅ Chat em tempo real com tool calling (OpenAI)
- ✅ Integração Google Calendar com OAuth
- ✅ Email notifications (SMTP)
- ✅ Form validation (honeypot, rate limit)
- ✅ Database persistence (SQLite + Alembic migrations)
- ✅ Admin dashboard (read-only)
- ✅ Multi-mode deployment (full-stack ou frontend-only)

### Pronto para Desenvolvimento

A codebase está **pronta para ser trabalhada** com base no contexto efetivamente encontrado:

- Estrutura bem organizada com responsabilidades claras
- Convenções TypeScript/Python consistentes
- Testes cobrindo principais fluxos
- Documentação técnica disponível
- Sem modificações necessárias nesta etapa de análise

---

**Análise Concluída**: 4 de agosto de 2026  
**Próximo Passo**: Apresentar oportunidades de melhoria ou executar especificações conforme necessário

