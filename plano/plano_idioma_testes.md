# Plano de idioma — testes

> Detalhamento de testes definido pelo [plano_idioma.md](plano_idioma.md), autoridade macro da implementação.

## Casos obrigatórios

- `/` sem preferência → `pt`;
- `/en/` → `en`;
- `/services` ↔ `/en/services`;
- query string/hash preservados;
- preferência válida restaurada e inválida ignorada;
- troca de idioma sem perda indevida de rota;
- bandeiras visíveis com menu mobile fechado;
- ordem logo, Brasil, USA, hamburger;
- `flag-usa.svg` no header;
- welcome PT usa `Chat-Welcome-Messages-br.json`;
- welcome EN usa `Chat-Welcome-Messages-en.json`;
- chave ausente usa fallback;
- CTA/troca limpa a tela sem persistir sessão vazia;
- primeira mensagem cria nova sessão;
- sessão anterior permanece no backend;
- usuário em outro idioma mantém a mesma sessão;
- context único;
- prompt inalterado;
- StyleGuide/Admin/CTA Editor fora do escopo.

## Comandos

```text
npm run build
npm test
npm run test:backend
npm run test:vertical
```

Não considerar concluído se teste existente falhar sem diagnóstico explícito.
