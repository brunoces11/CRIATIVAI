# Plano de implementação — idioma do site e do chat

## 1. Objetivo

Adicionar suporte a idiomas no frontend e no chat, começando pelo inglês e deixando o sistema preparado para o português.

O idioma selecionado deve controlar:

- textos visíveis do site;
- textos de acessibilidade e placeholders da interface;
- `welcome message` do chat;
- `context message` usado pelo agente;
- idioma usado para selecionar os catálogos de welcome e context do chat.

## 2. Regras obrigatórias

1. Os idiomas suportados inicialmente são `en` e `pt`.
2. `en` é o idioma inicial e o fallback obrigatório.
3. O idioma escolhido pelo usuário é a fonte de verdade. Não usar o idioma do navegador para substituir a escolha manual.
4. A troca de idioma deve atualizar o frontend imediatamente.
5. A troca de idioma não pode limpar, recriar, substituir ou alterar a sessão atual do chat.
6. A troca de idioma não pode apagar nem reescrever o histórico já exibido ou persistido.
7. O ciclo de vida atual das sessões deve ser preservado. Se algum CTA ou fluxo existente iniciar uma nova sessão, esse comportamento continua igual.
8. A troca de idioma, isoladamente, nunca deve chamar o fluxo que inicia uma nova sessão.
9. O `sessionId`, o `welcomeKey`, o histórico, o estado de carregamento e os demais estados do chat devem continuar funcionando como hoje, salvo a inclusão do idioma nas leituras.
10. Mensagens antigas não devem ser traduzidas retroativamente. É permitido que uma mesma conversa contenha mensagens de idiomas diferentes.
11. Toda leitura futura de welcome/context deve usar o idioma vigente no momento da leitura.
12. O agente deve responder no idioma vigente na requisição atual.
13. O idioma de interface (`en`/`pt`) não deve substituir `client_locale`, que continua representando a localidade do navegador para contexto de data, hora e fuso.
14. Chaves de tradução devem ser iguais entre idiomas. Não criar chaves diferentes para o mesmo conteúdo.
15. Não adicionar CMS, banco de traduções, API externa de tradução, detector automático ou carregamento remoto nesta etapa.

## 3. Dependências

Adicionar somente:

```text
i18next
react-i18next
```

Não adicionar inicialmente:

- `i18next-browser-languagedetector`;
- `i18next-http-backend`;
- backend HTTP para arquivos de tradução;
- biblioteca de tradução automática;
- CMS ou banco de dados de traduções.

Os JSONs do frontend devem ser importados localmente e empacotados pelo Vite. O idioma selecionado pode ser persistido com `localStorage`, sem plugin adicional.

## 4. Arquitetura de arquivos

### Frontend

Criar:

```text
src/i18n/config.ts
src/i18n/constants.ts
src/i18n/getCurrentLanguage.ts
src/locales/en.json
src/locales/pt.json
src/components/LanguageSwitcher.tsx
```

Não criar `LanguageContext.tsx` nem `useLanguage.ts`. Usar `useTranslation()` nos componentes React e `getCurrentLanguage()` nos módulos fora de React.

`constants.ts` deve definir `SUPPORTED_LANGUAGES`, o tipo `Language` e os nomes exibidos no seletor. `getCurrentLanguage.ts` deve normalizar e validar o idioma atual, retornando `en` como fallback.

### Catálogos do chat

Preservar o formato plano atual das chaves e criar catálogos por idioma:

```text
Chat-Welcome-Messages.en.json
Chat-Welcome-Messages.pt.json
Chat-Context-Messages.en.json
Chat-Context-Messages.pt.json
```

Os quatro arquivos devem conter as mesmas chaves CTA. Valores vazios continuam válidos para contextos que não possuem instrução adicional.

Os arquivos atuais `Chat-Welcome-Messages.json` e `Chat-Context-Messages.json` são catálogos planos, não catálogos bilíngues. O primeiro contém conteúdo predominantemente em português e o segundo contém contextos em português ou vazios. Eles não devem ser renomeados automaticamente como arquivos ingleses. Criar a versão inglesa aprovada e depois a versão portuguesa equivalente, sem inventar conteúdo durante a migração.

O conteúdo em inglês deve ser concluído e validado antes da ativação do seletor. O arquivo português deve ser criado/traduzido depois da versão inglesa estar consolidada; não inventar traduções ou conteúdo durante a migração sem texto inglês aprovado.

## 5. Configuração do i18next

Configurar:

- `lng: "en"` como idioma inicial quando não houver preferência válida salva;
- `fallbackLng: "en"`;
- `supportedLngs: ["en", "pt"]`;
- recursos locais importados dos JSONs;
- `react.useSuspense: false` se a configuração atual não tiver fallback visual para Suspense;
- retorno controlado para chave ausente, evitando exibir texto indefinido.

Importar `src/i18n/config.ts` antes da renderização do `App` em `src/main.tsx`.

Não ativar detecção automática de idioma. Ler e validar a preferência salva antes da renderização e inicializar o i18next diretamente com `en` ou `pt`, evitando flash inicial e troca posterior após o primeiro render.

## 6. Implementação em fases

### Fase 1 — infraestrutura e inglês

1. Instalar as duas dependências definidas.
2. Criar a configuração do i18next.
3. Criar a estrutura inicial de chaves em `en.json`.
4. Extrair os textos hardcoded para o JSON inglês.
5. Migrar páginas, componentes, dados de catálogo, formulários, modais, placeholders, `title`, `aria-label` e textos de estado do chat.
6. Não alterar URLs, IDs HTML, nomes de classes, chaves CTA, payloads existentes ou lógica de negócio.
7. Manter a interface visual em inglês e confirmar que o build continua funcionando.

### Fase 2 — idioma global e seletor

1. Criar o estado global através do i18next/contexto mínimo necessário.
2. Expor o idioma atual para componentes que não são React ou que fazem chamadas de API.
3. Fazer o `LanguageSwitcher` chamar `i18n.changeLanguage("en" | "pt")`.
4. Persistir somente a preferência de idioma em `localStorage`.
5. Ao carregar o site, restaurar essa preferência se for suportada; caso contrário, usar `en`.
6. Não alterar `sessionStorage` do chat durante a troca de idioma.
7. Manter o seletor acessível, com idioma atual identificado por `aria-current` e opção correspondente habilitada.

### Fase 3 — catálogos e fluxo do chat

#### Frontend do chat

1. O idioma vigente deve ser obtido da instância do i18next por `getCurrentLanguage()`.
2. Alterar `createWelcomeConversation()` para enviar `welcome_key` e `language`.
3. Alterar `sendChatMessage()` para enviar `language` junto com o payload atual.
4. Continuar enviando `client_locale` separadamente, sem reutilizá-lo como idioma escolhido.
5. Ao clicar em CTA, continuar usando o `welcomeKey` existente.
6. O CTA deve apenas consultar o catálogo correspondente ao idioma atual; não alterar a lógica atual que decide se uma nova sessão será iniciada.
7. A troca de idioma não deve executar `startWelcomeConversation()` nem qualquer rotina de reset. Rotinas existentes que iniciam novas sessões por outros motivos permanecem inalteradas.
8. Se um welcome já estiver sendo carregado quando o idioma mudar, cancelar somente a requisição de leitura obsoleta e permitir nova leitura com o idioma atual. Não limpar a sessão nem o histórico.
9. Mensagens já renderizadas permanecem como estão, exceto uma welcome que ainda não tenha recebido interação do usuário: nesse caso, ela deve ser relida no novo idioma e substituída imediatamente apenas na interface.
10. A substituição da welcome não pode alterar o `sessionId`, criar sessão, apagar histórico ou persistir uma mensagem adicional.

#### Backend do chat

1. Adicionar campo obrigatório `language` aos requests de welcome e de mensagem, aceitando somente `en` e `pt`.
2. Manter `client_locale` com o significado atual.
3. Alterar `chat_welcome.py` para resolver o arquivo pelo idioma recebido.
4. Alterar `chat_context.py` para resolver o arquivo pelo idioma recebido.
5. Usar fallback para os catálogos ingleses quando o idioma estiver ausente, inválido ou quando uma chave não existir.
6. Não criar nova coluna nem migration para idioma da conversa. O idioma deve ser tratado como estado da requisição, pois pode mudar durante a mesma sessão.
7. Não alterar `openai_chat.py`, prompts, instruções do agente ou lógica de resposta nesta etapa.
8. Manter intacta a persistência de mensagens, deduplicação de turnos, rate limit, contexto CTA, histórico, resumo e ferramentas de calendário.
10. O `welcome_key` continua sendo a mesma chave lógica nos dois idiomas; não incluir o idioma dentro da chave.

## 7. Editor administrativo de CTAs

Manter o CTA Editor completamente intacto nesta etapa. Não alterar suas rotas, frontend, autenticação, leitura, gravação ou arquivos utilizados.

A adaptação do CTA Editor para catálogos por idioma será feita somente depois da validação do mecanismo principal de idioma.

## 8. Compatibilidade e preservação

Não modificar sem necessidade:

- comportamento de abertura/fechamento do chat;
- criação de novas janelas, quando habilitada;
- persistência em `sessionStorage`;
- restauração de conversas;
- fluxo de CTAs e `welcomeKey`;
- endpoints não relacionados ao idioma;
- formato das mensagens persistidas;
- prompts administrativos e lógica de ferramentas.

O código deve reutilizar o catálogo e o carregador existentes do backend, parametrizando apenas o caminho do idioma, sem duplicar funções para cada idioma.

## 9. Fallbacks e erros

- Idioma desconhecido: usar `en`.
- Chave frontend ausente: usar fallback configurado e registrar erro em desenvolvimento.
- Chave de welcome ausente no idioma atual: tentar a mesma chave em inglês.
- Contexto vazio: manter o comportamento atual de não enviar contexto adicional.
- Falha ao carregar welcome: manter o tratamento de erro atual; não destruir a sessão existente.
- Falha ao trocar idioma: manter o idioma anterior ativo.

## 10. Testes obrigatórios

### Frontend

- build TypeScript/Vite;
- renderização inicial em inglês;
- troca para português e retorno para inglês;
- persistência e restauração da preferência;
- ausência de reset de `sessionId`, histórico e estados do chat ao trocar idioma;
- CTA usa o idioma vigente;
- mudança de idioma durante carregamento não deixa resposta de idioma anterior sobrescrever a atual;
- mensagens já renderizadas não são alteradas retroativamente.

### Backend

- welcome em inglês e português para a mesma chave;
- context em inglês e português para a mesma chave;
- fallback para inglês;
- rejeição ou normalização controlada de idioma inválido;
- seleção correta de welcome/context pelo idioma atual;
- `client_locale` continua separado do idioma da interface;
- mesma sessão aceita requisições sucessivas com idiomas diferentes;
- persistência e deduplicação atuais continuam passando.

Executar, no mínimo:

```text
npm run build
npm test
npm run test:backend
npm run test:vertical
```

## 11. Critério de aceite

A feature estará concluída somente quando:

1. Todo texto público previsto estiver vindo do JSON inglês.
2. O seletor mudar a interface sem reload.
3. A preferência for restaurada corretamente.
4. A troca de idioma não alterar o ciclo de vida nem o histórico da sessão de chat.
5. Cada CTA consultar welcome/context no JSON do idioma atual.
6. O fallback para inglês funcionar sem tela quebrada.
7. Os testes existentes e os novos testes de idioma passarem.

## 12. Restrições

Não implementar nesta etapa:

- tradução automática;
- CMS ou painel completo de tradução;
- URLs separadas por idioma;
- alteração retroativa do histórico;
- sessões separadas por idioma;
- detecção automática que ignore a preferência manual;
- mudança de comportamento dos CTAs ou da persistência atual;
- redesign visual do seletor ou do chat.

Referências técnicas: [react-i18next Quick Start](https://react.i18next.com/guides/quick-start) e [i18next Fallback](https://www.i18next.com/principles/fallback).
