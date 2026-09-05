# Plano de idioma — contratos

> Detalhamento técnico de contratos definido pelo [plano_idioma.md](plano_idioma.md), autoridade macro da implementação.

## Tipos e constantes

Criar `src/i18n/constants.ts`:

```ts
export const SUPPORTED_LANGUAGES = ["pt", "en"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "pt";
export const FALLBACK_LANGUAGE: Language = "en";
```

Criar `src/i18n/getCurrentLanguage.ts` com `getCurrentLanguage()`, `getLanguageFromPathname(pathname)` e `getLocalizedPath(pathname, language)`. Nenhuma função pode retornar código fora de `pt`/`en`.

## Arquivos

```text
src/locales/pt.json
src/locales/en.json
Chat-Welcome-Messages-br.json
Chat-Welcome-Messages-en.json
Chat-Context-Messages.json
```

Mapeamento obrigatório:

```text
pt → Chat-Welcome-Messages-br.json
en → Chat-Welcome-Messages-en.json
```

Os dois welcomes devem possuir as mesmas chaves CTA. O contexto é único.

## Contrato de welcome

`POST /api/chat/welcome` recebe:

```json
{
  "welcome_key": "services/service-catalog/product-design/ask-my-ai-assistant",
  "language": "pt"
}
```

O backend escolhe o arquivo e retorna o texto. O frontend nunca envia caminho de arquivo.

## Contrato da primeira mensagem

`POST /api/chat` recebe `language` e `welcome_key` junto dos campos atuais. `client_locale` continua sendo a localidade do navegador. O backend resolve novamente o welcome canônico antes de persistir; `welcome_message`, se mantido por compatibilidade, não é fonte de verdade.

## Fallback

- rota sem `/en`, sem preferência válida: `pt`;
- rota `/en/...`: `en`;
- chave ausente: procurar no catálogo alternativo;
- ausente nos dois: `null` e tratamento atual;
- idioma inválido: `pt`, exceto rota `/en`;
- nunca aceitar caminho de arquivo do cliente.
