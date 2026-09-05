# Plano de idioma — índice macro

> Documento principal da implementação. Define objetivo, decisões de produto, escopo e restrições globais. Os detalhes executáveis estão nos seis documentos referenciados abaixo.

## Objetivo

Adicionar português brasileiro e inglês ao site CriativAI, usando `pt` e `en` como códigos internos, com português como idioma padrão. Traduzir todas as páginas e componentes públicos, exceto `StyleGuide` e `Admin`.

## Decisões definitivas

- Fonte única de verdade: `i18next`.
- Dependências novas: somente `i18next` e `react-i18next`.
- Idiomas: `pt` e `en`; padrão `pt`; fallback `en`.
- Rotas: português na raiz; inglês com prefixo `/en/...`.
- Welcome PT: `Chat-Welcome-Messages-br.json`.
- Welcome EN: `Chat-Welcome-Messages-en.json`.
- Contexto: `Chat-Context-Messages.json` único, sem chaveamento.
- Header: logo à esquerda; Brasil, USA e hamburger à direita, nessa ordem; bandeiras sempre visíveis no mobile.
- O ícone USA é `flag-usa.svg`; ele é apenas visual e não é o código do idioma.
- Clique em CTA ou troca de bandeira limpa o chat visível e prepara nova conversa.
- A nova sessão só é criada/persistida após a primeira mensagem do usuário.
- A sessão anterior permanece no backend, mas deixa de ser ativa e visível no frontend.
- Não haverá navegação entre sessões nesta fase.
- O usuário pode escrever em qualquer idioma durante a mesma conversa sem criar nova sessão.
- Prompt, instruções e lógica de resposta do agente permanecem intactos.
- CTA Editor permanece intacto.

## Escopo público

Traduzir Home, Video, Services, Contact, About Me, Hire Me, Human Resources/Recruiters, Founding SDR, Talent Preview, Privacy/Terms, `SiteHeader`, `ChatWidget`, formulários, modais, placeholders, títulos e acessibilidade dos componentes públicos.

Fora do escopo: `StyleGuide`, `Admin`, CTA Editor e prompts.

## Documentos técnicos

- [Contratos](plano_idioma_contratos.md) — tipos, constantes, JSONs, payloads e fallback.
- [Frontend](plano_idioma_frontend.md) — i18next, páginas e arquivos permitidos.
- [Rotas](plano_idioma_rotas.md) — `/en`, header, bandeiras e responsividade.
- [Chat](plano_idioma_chat.md) — CTA, welcome, sessões e backend.
- [Testes](plano_idioma_testes.md) — casos, comandos e aceite.
- [Ordem de implementação](plano_idioma_ordem_implementacao.md) — sequência e checkpoints.

## Regra de uso

Ler este arquivo primeiro e, depois, somente o documento técnico da etapa atual. Este índice prevalece sobre qualquer divergência encontrada nos documentos específicos. Não criar arquitetura alternativa.
