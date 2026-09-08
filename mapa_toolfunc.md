# Mapa de Tools e Functions - CriativAI

## Visão Geral

Este documento mapeia todas as **tools** (ferramentas) disponíveis para o agente de IA do CriativAI e as **funções** que cada tool executa. O agente utiliza estas ferramentas durante conversas com visitantes para automatizar processos de agendamento, captura de contatos e criação de briefings.

---

## 📋 Lista Completa de Tools

O agente possui acesso a **7 tools principais**, divididas em 3 categorias:

### 🗓️ **Categoria: Calendar Tools** (5 tools)
### 📝 **Categoria: Contact & Briefing Tools** (2 tools)

---

## 📑 Índice Rápido de Tools

### 🗓️ Calendar Tools

| # | Tool | Função |
|---|------|--------|
| 1 | **`calendar_check_availability`** | Buscar horários disponíveis no calendário para uma data/período específico |
| 2 | **`calendar_create_event`** | Criar novo evento confirmado no Google Calendar com participante e Google Meet |
| 3 | **`calendar_lookup_bookings`** | Listar todos os eventos futuros de um participante para verificar ou modificar |
| 4 | **`calendar_update_event`** | Remarcar um evento existente para nova data/hora |
| 5 | **`calendar_cancel_event`** | Cancelar um evento existente no calendário |

### 📝 Contact & Briefing Tools

| # | Tool | Função |
|---|------|--------|
| 6 | **`chat_capture_contact`** | Salvar dados do visitante (nome, email, empresa) na conversa atual |
| 7 | **`project_briefing_send_email`** | Criar briefing de projeto e enviar por email para Bruno e cliente |

---

---

## 🗓️ CALENDAR TOOLS

### Tool 1: `calendar_check_availability`

**Propósito**: Verificar disponibilidade de horários na agenda do Google Calendar

**Função Executada**: `calendar_check_availability()`  
**Arquivo**: `backend/app/calendar_availability.py`

#### Parâmetros de Entrada

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `visitor_timezone` | string | ✅ Sim | Timezone IANA do visitante (ex: "America/Sao_Paulo") |
| `requested_start` | datetime | ❌ Não | Data/hora específica solicitada |
| `requested_date` | date | ❌ Não | Data sem hora específica (para busca de dia inteiro) |
| `requested_end_date` | date | ❌ Não | Data final para range (ex: "próxima semana") |
| `requested_period` | string | ❌ Não | Período do dia: "morning", "afternoon", "evening" |

#### Saída Retornada

```json
{
  "slots": [
    {
      "start": "2026-08-05T14:00:00-03:00",
      "end": "2026-08-05T14:30:00-03:00",
      "timezone": "America/Sao_Paulo"
    }
  ]
}
```

#### Fluxo de Execução

1. Valida timezone do visitante
2. Calcula janela de busca (24h - 14 dias padrão)
3. Consulta API Freebusy do Google Calendar
4. Filtra períodos ocupados
5. Gera slots disponíveis de 30 minutos
6. Aplica buffer de 15 minutos entre eventos
7. Retorna lista de slots disponíveis

#### Regras de Negócio

- **Aviso mínimo**: 24 horas (configurável)
- **Duração do slot**: 30 minutos (configurável)
- **Buffer entre slots**: 15 minutos (configurável)
- **Janela de sugestões**: 14 dias (configurável)
- **Máximo de slots retornados**: Limitado por configuração

---

### Tool 2: `calendar_create_event`

**Propósito**: Criar um novo evento no Google Calendar com confirmação do visitante

**Função Executada**: `calendar_create_event()`  
**Arquivo**: `backend/app/calendar_booking.py`

#### Parâmetros de Entrada

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `participant_name` | string | ✅ Sim | Nome do participante (1-200 chars) |
| `participant_email` | string | ✅ Sim | Email válido do participante |
| `visitor_timezone` | string | ✅ Sim | Timezone IANA do visitante |
| `starts_at` | datetime | ✅ Sim | Data/hora de início do evento |
| `idempotency_key` | string | ✅ Sim | Chave única (16-128 chars) para evitar duplicação |
| `meeting_summary` | string | ✅ Sim | Resumo da conversa (20-1200 chars) |
| `confirmed` | boolean | ✅ Sim | Deve ser `true` (confirmação explícita obrigatória) |

#### Saída Retornada

```json
{
  "booking_id": 123,
  "google_event_id": "cai7a8b9c0d1e2f3...",
  "starts_at_utc": "2026-08-05T17:00:00Z",
  "ends_at_utc": "2026-08-05T17:30:00Z",
  "timezone": "America/Sao_Paulo",
  "status": "confirmed",
  "participant_name": "João Silva",
  "participant_email": "joao@example.com",
  "conversation_summary": "Reunião para discutir...",
  "meet_link": "https://meet.google.com/abc-defg-hij"
}
```

#### Fluxo de Execução

1. **Validação de idempotência**: Verifica se já existe booking com mesmo `idempotency_key`
2. **Validação de disponibilidade**: Confirma que o slot ainda está disponível
3. **Geração de Event ID**: Cria ID determinístico do Google Calendar
4. **Criação no Google Calendar**:
   - Cria evento com título: "Reunião CriativAI"
   - Adiciona participante como attendee
   - Gera Google Meet link (se habilitado)
   - Define propriedades estendidas para rastreamento
5. **Persistência no banco**: Salva registro em tabela `bookings`
6. **Atualização da conversa**: Marca `booking_state = "confirmed"`
7. **Sync admin**: Cria registro em `admin_records`
8. **Notificação por email**: Envia email ao owner (Bruno) informando novo agendamento

#### Regras de Negócio

- **Confirmação obrigatória**: `confirmed` deve ser `true`
- **Idempotência**: Múltiplas chamadas com mesmo key retornam mesmo resultado
- **Slot validation**: Slot deve ter sido oferecido via `calendar_check_availability`
- **Google Meet**: Adicionado automaticamente (configurável)
- **Duração fixa**: 30 minutos (configurável)

---

### Tool 3: `calendar_lookup_bookings`

**Propósito**: Buscar todos os eventos futuros de um participante específico

**Função Executada**: `calendar_lookup_bookings()`  
**Arquivo**: `backend/app/calendar_booking.py`

#### Parâmetros de Entrada

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `participant_email` | string | ✅ Sim | Email do participante para buscar eventos |

#### Saída Retornada

```json
{
  "bookings": [
    {
      "booking_id": 123,
      "google_event_id": "cai7a8b9c0d1e2f3...",
      "starts_at_utc": "2026-08-05T17:00:00Z",
      "ends_at_utc": "2026-08-05T17:30:00Z",
      "timezone": "America/Sao_Paulo",
      "status": "confirmed",
      "participant_name": "João Silva",
      "participant_email": "joao@example.com",
      "conversation_summary": "Reunião para discutir...",
      "meet_link": "https://meet.google.com/abc-defg-hij"
    }
  ]
}
```

#### Fluxo de Execução

1. **Validação de email**: Verifica formato válido
2. **Busca no Google Calendar**: Consulta eventos futuros (até 365 dias)
3. **Filtragem por attendee**: Retorna apenas eventos onde o email é participante
4. **Merge com banco local**: Combina dados do Google com registros locais
5. **Ordenação**: Ordena por data de início (mais próximo primeiro)
6. **Exclusão de cancelados**: Remove eventos com status "cancelled"

#### Regras de Negócio

- **Janela de busca**: Eventos futuros até 365 dias (configurável)
- **Sem limite de resultados**: Retorna todos os eventos encontrados
- **Status sincronizado**: Verifica status real no Google Calendar
- **Uso típico**: Executado antes de `calendar_update_event` ou `calendar_cancel_event`

---

### Tool 4: `calendar_update_event`

**Propósito**: Remarcar um evento existente no Google Calendar

**Função Executada**: `calendar_update_event()`  
**Arquivo**: `backend/app/calendar_booking.py`

#### Parâmetros de Entrada

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `participant_email` | string | ✅ Sim | Email do participante |
| `booking_id` | integer | ❌ Não | ID do booking (se conhecido, acelera busca) |
| `visitor_timezone` | string | ✅ Sim | Timezone IANA do visitante |
| `new_starts_at` | datetime | ✅ Sim | Nova data/hora de início |
| `confirmed` | boolean | ✅ Sim | Deve ser `true` (confirmação explícita obrigatória) |

#### Saída Retornada

```json
{
  "booking_id": 123,
  "google_event_id": "cai7a8b9c0d1e2f3...",
  "starts_at_utc": "2026-08-06T15:00:00Z",
  "ends_at_utc": "2026-08-06T15:30:00Z",
  "timezone": "America/Sao_Paulo",
  "status": "confirmed",
  "participant_name": "João Silva",
  "participant_email": "joao@example.com",
  "conversation_summary": "Reunião para discutir...",
  "meet_link": "https://meet.google.com/abc-defg-hij"
}
```

#### Fluxo de Execução

1. **Busca de booking**: Localiza evento por email + booking_id (opcional)
2. **Validação de novo slot**: Verifica disponibilidade da nova data/hora
3. **Atualização no Google Calendar**: Executa PATCH no evento
4. **Atualização no banco**: Atualiza timestamps no registro local
5. **Notificação por email**: Envia email ao owner informando remarcação
6. **Notificação aos participantes**: Google envia emails automáticos

#### Regras de Negócio

- **Confirmação obrigatória**: `confirmed` deve ser `true`
- **Múltiplos eventos**: Se encontrar mais de 1 evento, retorna lista de candidatos e pede clarificação
- **Validação de disponibilidade**: Novo slot deve estar disponível
- **Preservação de Meet link**: Link original é mantido
- **Duração fixa**: Mantém 30 minutos

---

### Tool 5: `calendar_cancel_event`

**Propósito**: Cancelar um evento existente no Google Calendar

**Função Executada**: `calendar_cancel_event()`  
**Arquivo**: `backend/app/calendar_booking.py`

#### Parâmetros de Entrada

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `participant_email` | string | ✅ Sim | Email do participante |
| `booking_id` | integer | ❌ Não | ID do booking (se conhecido, acelera busca) |
| `confirmed` | boolean | ✅ Sim | Deve ser `true` (confirmação explícita obrigatória) |

#### Saída Retornada

```json
{
  "booking_id": 123,
  "google_event_id": "cai7a8b9c0d1e2f3...",
  "starts_at_utc": "2026-08-05T17:00:00Z",
  "ends_at_utc": "2026-08-05T17:30:00Z",
  "timezone": "America/Sao_Paulo",
  "status": "cancelled",
  "participant_name": "João Silva",
  "participant_email": "joao@example.com",
  "conversation_summary": "Reunião para discutir...",
  "meet_link": "https://meet.google.com/abc-defg-hij"
}
```

#### Fluxo de Execução

1. **Busca de booking**: Localiza evento por email + booking_id (opcional)
2. **Exclusão no Google Calendar**: Executa DELETE no evento
3. **Atualização no banco**: Marca status como "cancelled" + timestamp
4. **Notificação por email**: Envia email ao owner informando cancelamento
5. **Notificação aos participantes**: Google envia emails automáticos de cancelamento

#### Regras de Negócio

- **Confirmação obrigatória**: `confirmed` deve ser `true`
- **Múltiplos eventos**: Se encontrar mais de 1 evento, retorna lista de candidatos e pede clarificação
- **Soft delete**: Registro permanece no banco com status "cancelled"
- **Irreversível**: Cancelamento não pode ser desfeito (criar novo evento se necessário)

---

## 📝 CONTACT & BRIEFING TOOLS

### Tool 6: `chat_capture_contact`

**Propósito**: Salvar informações de contato do visitante na conversa atual

**Função Executada**: `chat_capture_contact()`  
**Arquivo**: `backend/app/project_briefings.py`

#### Parâmetros de Entrada

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `name` | string | ✅ Sim | Nome do visitante (1-200 chars) |
| `email` | string | ✅ Sim | Email válido do visitante |
| `company` | string | ❌ Não | Nome da empresa (max 200 chars) |
| `confirmed` | boolean | ✅ Sim | Deve ser `true` (confirmação explícita obrigatória) |

#### Saída Retornada

```json
{
  "conversation_id": 456,
  "visitor_name": "João Silva",
  "visitor_email": "joao@example.com",
  "visitor_company": "Acme Corp"
}
```

#### Fluxo de Execução

1. **Validação de confirmação**: Verifica `confirmed === true`
2. **Normalização de dados**:
   - Trim de espaços em branco
   - Lowercase no email
   - Company null se vazio
3. **Validação de email**: Verifica formato válido
4. **Atualização da conversa**: Persiste dados em `Conversation` table:
   - `visitor_name`
   - `visitor_email`
   - `visitor_company`
   - `updated_at`
5. **Commit no banco**: Salva alterações

#### Regras de Negócio

- **Confirmação obrigatória**: Nunca salvar sem confirmação explícita do usuário
- **Email único por conversa**: Atualiza se já existir
- **Company opcional**: Pode ser null
- **Sem duplicação**: Múltiplas chamadas atualizam o mesmo registro

---

### Tool 7: `project_briefing_send_email`

**Propósito**: Criar e enviar briefing de projeto por email para Bruno e para o cliente

**Função Executada**: `project_briefing_send_email()`  
**Arquivo**: `backend/app/project_briefings.py`

#### Parâmetros de Entrada

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `briefing_title` | string | ✅ Sim | Título curto do briefing (1-220 chars) |
| `briefing_markdown` | string | ✅ Sim | Conteúdo completo em Markdown (1-40000 chars) |
| `confirmed` | boolean | ✅ Sim | Deve ser `true` (confirmação explícita obrigatória) |

#### Saída Retornada

```json
{
  "briefing_id": 789,
  "conversation_id": 456,
  "briefing_title": "Projeto de Automação com IA",
  "briefing_status": "sent",
  "owner_email_status": "sent",
  "client_email_status": "sent",
  "email_error": null,
  "briefing_sent_at": "2026-08-04T10:30:00Z"
}
```

#### Fluxo de Execução

1. **Validação de confirmação**: Verifica `confirmed === true`
2. **Geração de idempotency key**: Hash SHA256 de (conversation_id + turn_id + title + markdown)
3. **Verificação de duplicação**: Checa se já existe briefing com mesmo key
4. **Validação de contato**: Verifica se `visitor_name` e `visitor_email` existem na conversa
5. **Criação do registro**: Salva em tabela `project_briefings`
6. **Sync admin**: Cria registro em `admin_records`
7. **Envio de email ao owner** (Bruno):
   - **Para**: `bruno@criativai.site` (configurável)
   - **Assunto**: `[CriativAI] New project briefing: {title}`
   - **Corpo**: Dados do cliente + briefing completo
   - **Reply-To**: Email do cliente
8. **Envio de email ao cliente**:
   - **Para**: Email do visitante
   - **Assunto**: `CriativAI received your briefing: {title}`
   - **Corpo**: Confirmação de recebimento + resumo
9. **Atualização de status**: Marca como "sent" se ambos emails enviados com sucesso

#### Regras de Negócio

- **Confirmação obrigatória**: Nunca enviar sem confirmação explícita
- **Contato pré-requisito**: `visitor_name` e `visitor_email` devem existir (usar `chat_capture_contact` antes)
- **Idempotência**: Múltiplas chamadas com mesmo conteúdo retornam mesmo briefing
- **Email duplo**: Sempre envia para owner E cliente
- **Status tracking**: Registra sucesso/falha de cada email separadamente
- **Formato preservado**: Markdown é enviado como texto + HTML

---

## 🔄 FLUXOS TÍPICOS DE USO

### Fluxo 1: Agendamento Simples

```
1. Visitante: "Quero agendar uma reunião amanhã"
2. Agente chama: calendar_check_availability(
     visitor_timezone="America/Sao_Paulo",
     requested_date="2026-08-05"
   )
3. Agente apresenta slots disponíveis
4. Visitante escolhe: "14h está bom"
5. Agente pede confirmação de email
6. Visitante: "Sim, joao@example.com"
7. Agente chama: calendar_create_event(
     participant_name="João",
     participant_email="joao@example.com",
     visitor_timezone="America/Sao_Paulo",
     starts_at="2026-08-05T14:00:00",
     idempotency_key="booking_abc123...",
     meeting_summary="Reunião para discutir automação...",
     confirmed=true
   )
8. Evento criado + emails enviados ✅
```

### Fluxo 2: Remarcação de Evento

```
1. Visitante: "Preciso remarcar minha reunião"
2. Agente pede confirmação de email
3. Visitante: "joao@example.com"
4. Agente chama: calendar_lookup_bookings(
     participant_email="joao@example.com"
   )
5. Agente mostra evento encontrado
6. Visitante: "Pode ser dia 06 às 15h"
7. Agente chama: calendar_check_availability(
     visitor_timezone="America/Sao_Paulo",
     requested_start="2026-08-06T15:00:00"
   )
8. Agente confirma disponibilidade
9. Agente chama: calendar_update_event(
     participant_email="joao@example.com",
     booking_id=123,
     visitor_timezone="America/Sao_Paulo",
     new_starts_at="2026-08-06T15:00:00",
     confirmed=true
   )
10. Evento remarcado + emails enviados ✅
```

### Fluxo 3: Briefing Completo

```
1. Visitante: "Quero fazer um briefing"
2. Agente coleta: nome, email, empresa
3. Agente faz 5 perguntas do briefing
4. Visitante responde todas
5. Agente compila em Markdown
6. Agente exibe briefing + pede confirmação
7. Visitante: "Confirmo"
8. Agente chama: chat_capture_contact(
     name="João Silva",
     email="joao@example.com",
     company="Acme Corp",
     confirmed=true
   )
9. Agente chama: project_briefing_send_email(
     briefing_title="Automação de RH",
     briefing_markdown="## Motivo...",
     confirmed=true
   )
10. Briefing salvo + 2 emails enviados ✅
```

---

## ⚙️ CONFIGURAÇÕES E LIMITES

### Configurações do Calendário

| Configuração | Valor Padrão | Descrição |
|--------------|--------------|-----------|
| `CALENDAR_SLOT_MINUTES` | 30 | Duração de cada slot em minutos |
| `CALENDAR_BUFFER_MINUTES` | 15 | Buffer entre eventos consecutivos |
| `CALENDAR_MIN_NOTICE_HOURS` | 24 | Aviso mínimo para agendamento |
| `CALENDAR_MAX_WINDOW_DAYS` | 14 | Janela máxima de sugestões |
| `CALENDAR_LOOKUP_WINDOW_DAYS` | 365 | Janela de busca de bookings existentes |
| `CALENDAR_SUGGESTION_COUNT` | 3 | Número de slots sugeridos |
| `CALENDAR_ADD_GOOGLE_MEET` | true | Adicionar Google Meet automaticamente |

### Limites de Tools

| Tool | Limite | Tipo |
|------|--------|------|
| `calendar_check_availability` | Ilimitado | Por conversa |
| `calendar_create_event` | Idempotente | Por idempotency_key |
| `calendar_lookup_bookings` | Ilimitado | Por conversa |
| `calendar_update_event` | Ilimitado | Por booking |
| `calendar_cancel_event` | Ilimitado | Por booking |
| `chat_capture_contact` | Ilimitado | Por conversa (atualiza) |
| `project_briefing_send_email` | Idempotente | Por idempotency_key |

### Limites do Chat

| Configuração | Valor Padrão | Descrição |
|--------------|--------------|-----------|
| `CHAT_TOOL_MAX_ITERATIONS` | 4 | Máximo de iterações de tools por turno |
| `CHAT_RATE_LIMIT_COUNT` | 8 | Máximo de mensagens |
| `CHAT_RATE_LIMIT_WINDOW_SECONDS` | 60 | Janela de rate limiting |

---

## 🛡️ REGRAS DE SEGURANÇA

### Validações Obrigatórias

1. **Confirmação explícita**: Todas as tools que executam ações (create, update, cancel, capture, send) exigem `confirmed=true`
2. **Email validation**: Formato RFC 5322 validado via regex
3. **Timezone validation**: IANA timezone válido obrigatório
4. **Idempotência**: Keys devem ter 16-128 caracteres alfanuméricos
5. **String lengths**: Limites rígidos em todos os campos de texto

### Proteções Implementadas

- **Duplicação**: Idempotency keys previnem duplicação de bookings e briefings
- **Slot validation**: Slots devem ter sido oferecidos antes de serem agendados
- **Email case-insensitive**: Emails sempre comparados em lowercase
- **Timezone source**: Browser timezone registrado como fonte

---

## 📊 TABELAS DO BANCO DE DADOS

### Tabelas Afetadas pelas Tools

| Tool | Tabela(s) Modificada(s) | Operação |
|------|------------------------|----------|
| `calendar_check_availability` | Nenhuma | Apenas consulta Google Calendar |
| `calendar_create_event` | `bookings`, `conversations`, `admin_records` | INSERT + UPDATE |
| `calendar_lookup_bookings` | Nenhuma | Apenas consulta Google Calendar + banco |
| `calendar_update_event` | `bookings` | UPDATE |
| `calendar_cancel_event` | `bookings` | UPDATE (soft delete) |
| `chat_capture_contact` | `conversations` | UPDATE |
| `project_briefing_send_email` | `project_briefings`, `admin_records` | INSERT |

---

## 🔧 ARQUIVOS FONTE

### Localização das Implementações

| Tool | Definição | Implementação | Handler |
|------|-----------|---------------|---------|
| `calendar_check_availability` | `calendar_tools.py` | `calendar_availability.py` | `execute_calendar_tool()` |
| `calendar_create_event` | `calendar_tools.py` | `calendar_booking.py` | `execute_calendar_tool()` |
| `calendar_lookup_bookings` | `calendar_tools.py` | `calendar_booking.py` | `execute_calendar_tool()` |
| `calendar_update_event` | `calendar_tools.py` | `calendar_booking.py` | `execute_calendar_tool()` |
| `calendar_cancel_event` | `calendar_tools.py` | `calendar_booking.py` | `execute_calendar_tool()` |
| `chat_capture_contact` | `calendar_tools.py` | `project_briefings.py` | `execute_calendar_tool()` |
| `project_briefing_send_email` | `calendar_tools.py` | `project_briefings.py` | `execute_calendar_tool()` |

### Arquivos Principais

- **`backend/app/calendar_tools.py`**: Definição de schemas Pydantic + lista `CALENDAR_TOOLS` + router `execute_calendar_tool()`
- **`backend/app/openai_chat.py`**: Integração com OpenAI + loop de execução de tools
- **`backend/app/chat.py`**: Orquestração do chat + streaming + rate limiting

---

## 📝 NOTAS IMPORTANTES

### Sobre Confirmações

Todas as tools que executam **ações irreversíveis ou sensíveis** exigem confirmação explícita do usuário:
- ✅ `calendar_create_event`: Cria evento (confirmed=true)
- ✅ `calendar_update_event`: Remarca evento (confirmed=true)
- ✅ `calendar_cancel_event`: Cancela evento (confirmed=true)
- ✅ `chat_capture_contact`: Salva dados pessoais (confirmed=true)
- ✅ `project_briefing_send_email`: Envia emails (confirmed=true)
- ❌ `calendar_check_availability`: Apenas consulta (sem confirmação)
- ❌ `calendar_lookup_bookings`: Apenas consulta (sem confirmação)

### Sobre Idempotência

Algumas tools são **idempotentes** por design:
- `calendar_create_event`: Múltiplas chamadas com mesmo `idempotency_key` retornam mesmo booking
- `project_briefing_send_email`: Múltiplas chamadas com mesmo conteúdo retornam mesmo briefing

### Sobre Notificações

Emails automáticos são enviados em várias situações:
- **Owner (Bruno)**: Recebe notificação de novos bookings, remarcações, cancelamentos e briefings
- **Cliente**: Recebe confirmação de booking e confirmação de recebimento de briefing
- **Google Calendar**: Envia emails automáticos aos participantes quando eventos são criados/atualizados/cancelados

---

**Última atualização**: 2026-08-04  
**Versão**: 1.0.0
