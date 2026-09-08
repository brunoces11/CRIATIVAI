# Plano de idioma — chat

> Detalhamento técnico do chat definido pelo [plano_idioma.md](plano_idioma.md), autoridade macro da implementação.

## Regras

O usuário pode escrever em qualquer idioma durante a conversa. Isso não cria sessão nova. Nova conversa é preparada somente por CTA ou troca de bandeira.

A nova sessão só é criada/persistida após a primeira mensagem do usuário. A sessão anterior permanece no backend e não pode ser acessada pelo frontend nesta fase.

## Fluxo CTA/bandeira

```text
evento
→ abortar welcome/stream anterior
→ limpar chat visível
→ remover referência da sessão ativa no frontend
→ preservar sessão anterior no backend
→ consultar /api/chat/welcome com welcomeKey + language
→ exibir welcome
→ não persistir sessão vazia
```

Primeira mensagem:

```text
enviar message + welcome_key + language
→ backend resolve welcome canônico
→ backend cria/persiste conversa
→ frontend recebe session_start
→ salvar sessionId
```

## Frontend

Modificar `src/lib/chatStream.ts`: `createWelcomeConversation(welcomeKey, language, signal)`. O frontend não escolhe arquivo.

Modificar `src/components/ChatWidget.tsx` somente para obter idioma via `getCurrentLanguage()`, passar idioma, limpar/preparar conversa na troca de bandeira e preservar aborts, streaming e restauração atuais.

## Backend

Modificar `backend/app/schemas.py`, `backend/app/main.py`, `backend/app/chat_welcome.py` e o trecho necessário de `backend/app/chat.py`.

Adicionar `language: Literal["pt", "en"]` aos requests. Mapear `pt` para `Chat-Welcome-Messages-br.json` e `en` para `Chat-Welcome-Messages-en.json`. O backend resolve o texto canônico e não confia no `welcome_message` do navegador.

Manter intactos `backend/app/openai_chat.py`, prompts, `Chat-Context-Messages.json`, ferramentas, resumo, rate limit, deduplicação e formato persistido.

## CTA Editor

Não modificar `backend/app/cta_editor.py`, `src/components/CtaEditorButton.tsx` ou `src/lib/ctaEditor.ts`. O editor continuará temporariamente apontando para o catálogo inglês.
