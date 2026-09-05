# Plano de idioma — ordem de implementação

> Detalhamento da sequência definido pelo [plano_idioma.md](plano_idioma.md), autoridade macro da implementação.

## Fase 0 — preparação

Ler o índice, ler o documento da etapa atual, confirmar arquivos fora do escopo e inventariar textos públicos/chaves CTA.

## Fase 1 — i18next

Instalar somente `i18next` e `react-i18next`; criar constantes, configuração, helper e JSONs; importar antes de `createRoot()`; executar build.

## Fase 2 — frontend

Migrar textos públicos para JSON, usar `useTranslation()`, manter português padrão e executar build.

## Fase 3 — rotas/header

Normalizar `/en`, implementar preservação de rota, reposicionar bandeiras fora de `header-right`, usar os dois ícones e validar desktop/mobile.

## Fase 4 — chat

Adicionar `language` aos schemas/requests, tornar backend autoridade do welcome, preservar criação tardia da sessão, implementar troca de idioma com o mesmo mecanismo de CTA e não alterar prompt/context.

## Fase 5 — validação

Executar todos os testes, revisar diff, confirmar arquivos fora do escopo e validar manualmente `/`, `/en/`, página interna, CTA, troca de bandeira e mobile.

## Regra de parada

Se requisito estiver ambíguo, teste quebrar ou for necessário alterar arquivo proibido, parar e reportar antes de continuar.
