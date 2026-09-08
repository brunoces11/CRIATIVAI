# Plano de idioma — rotas e header

> Detalhamento técnico de rotas e header definido pelo [plano_idioma.md](plano_idioma.md), autoridade macro da implementação.

## Mapeamento

| PT | EN |
|---|---|
| `/` | `/en/` |
| `/services` | `/en/services` |
| `/contact` | `/en/contact` |
| `/about-me` | `/en/about-me` |
| `/hire-me` | `/en/hire-me` |
| `/for-recrutiers` | `/en/for-recrutiers` |
| `/founding-sdr` | `/en/founding-sdr` |
| `/talent-preview` | `/en/talent-preview` |
| `/video` | `/en/video` |
| `/privacy` | `/en/privacy` |
| `/terms` | `/en/terms` |

`/style` e `/adm` ficam fora do chaveamento público.

## Normalização

`src/App.tsx` remove somente o prefixo `/en` antes do roteamento interno. `/en/services` deve renderizar a mesma página interna de `/services`, com idioma `en`. Preservar query string e hash.

## Header

Modificar `src/components/SiteHeader.tsx` e criar/incorporar `LanguageSwitcher`.

Desktop e mobile devem sempre mostrar:

```text
logo | flag-brazil.svg | flag-usa.svg | hamburger
```

As bandeiras ficam fora de `header-right`, que é ocultado no mobile quando o menu está fechado.

- Brasil: `changeLanguage("pt")` e rota sem `/en`;
- USA: `changeLanguage("en")` e rota com `/en`;
- salvar preferência após validar;
- idioma ativo com `aria-current="true"`;
- não usar `flag-uk.svg` nem `Flag-United-Kingdom.svg`.
