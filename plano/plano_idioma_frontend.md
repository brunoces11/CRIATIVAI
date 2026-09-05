# Plano de idioma — frontend

> Detalhamento técnico do frontend definido pelo [plano_idioma.md](plano_idioma.md), autoridade macro da implementação.

## Configuração

Criar `src/i18n/config.ts` e exportar uma única instância `i18n`. Usar `initReactI18next`, recursos locais `pt`/`en`, `fallbackLng: "en"`, `supportedLngs: ["pt", "en"]`, `escapeValue: false` e `react.useSuspense: false`.

Importar a configuração antes de `createRoot()` em `src/main.tsx`.

Não criar `LanguageContext.tsx` nem `useLanguage.ts`. Componentes usam `useTranslation()`; módulos fora de React usam `getCurrentLanguage()`.

## Inicialização

Antes de renderizar: `/en` ou `/en/...` → `en`; preferência válida em `localStorage` → preferência; ausência/valor inválido → `pt`. Usar uma única chave, por exemplo `criativai:language`.

## Migração

Migrar para JSON todo texto público, incluindo texto visível, `aria-label`, `title`, placeholders, estados, formulários, modais e dados de catálogo. Não migrar `StyleGuide`, `Admin`, CTA Editor ou prompts.

Não alterar IDs, classes, nomes de CTA, `welcomeKey`, endpoints ou lógica de negócio sem instrução dos documentos de rotas/chat.

## Arquivos permitidos

Criar os arquivos de i18n e modificar apenas componentes públicos necessários, `src/main.tsx`, `src/App.tsx`, `src/components/SiteHeader.tsx`, `src/components/ChatWidget.tsx`, `src/lib/chatStream.ts` e testes correspondentes. Não criar estado paralelo ao i18next.
