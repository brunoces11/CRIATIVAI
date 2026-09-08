# Neon Text - fluxo replicavel

## Regra inicial obrigatoria

Antes de gerar qualquer raio, o processo deve inspecionar o elemento-alvo e obter a tipografia efetivamente aplicada:

- `font-family` resolvida;
- `font-weight`;
- `font-style`;
- `font-stretch`;
- `font-size`;
- `letter-spacing`;
- idioma e texto final renderizado.

Em seguida, deve verificar se o arquivo da fonte ja existe localmente em formato compativel (`TTF`, `OTF` ou `WOFF`). Nao e permitido gerar raios usando uma fonte substituta ou fallback.

## Pipeline

1. Selecionar o elemento e capturar texto e estilos computados.
2. Executar o discovery de layout no DOM final, antes de gerar qualquer path. Capturar `getBoundingClientRect()` do texto e do contenedor imediato, incluindo `x`, `y`, `width`, `height`, `top`, `left`, `right`, `bottom` e a relacao entre as duas caixas.
3. Capturar tambem `font-family`, `font-weight`, `font-style`, `font-stretch`, `font-size`, `line-height`, `letter-spacing`, `word-spacing`, `text-transform`, `writing-mode`, `direction`, `display`, `position`, `padding`, `border`, `box-sizing` e o texto final renderizado.
4. Esperar as fontes estarem prontas (`document.fonts.ready`) e repetir a medicao depois do carregamento. O snapshot valido e o da renderizacao final, nao o de uma fonte fallback ou de uma caixa estimada.
5. Resolver a fonte, o peso, o tamanho e as metricas exatos observados no DOM. Se qualquer metrica mudar, invalidar o outline anterior e gerar outro; nunca compensar a diferenca com ajuste manual posterior.
6. Localizar ou baixar o arquivo compativel da fonte.
7. Converter cada glifo em outline vetorial usando o mesmo texto, ordem dos glifos, kerning, tamanho e espacamento descobertos no DOM.
8. Comparar a caixa calculada do outline com a caixa medida do texto. O outline so pode ser aceito quando a origem, a largura, a altura e a proporcao coincidirem dentro da tolerancia de rasterizacao definida pelo projeto.
9. Preservar a geometria original do outline, incluindo posicionamento, kerning e espacamento. A conversao das unidades internas da fonte para pixels e permitida apenas durante a extracao.
10. Duplicar o outline somente para criar a camada visual do efeito.
11. Dividir a copia em segmentos sem alterar a geometria dos paths.
12. Manter os paths na mesma geometria do outline extraido. Nao aplicar offsets, deslocamentos, distorcoes ou correcoes de escala no fluxo padrao.
13. Renderizar o SVG na mesma caixa medida do elemento, usando a mesma origem relativa ao contenedor e a mesma area de desenho. O SVG deve sobrepor o texto, nao apenas ocupar um espaco aproximado.
14. Exportar os segmentos como paths SVG e armazenar o resultado por `texto + fonte + peso + estilo + tamanho + metricas-do-DOM`.
15. Renderizar o SVG atraves do componente global `NeonText`.
16. Deixar o CSS controlar apenas glow, dash, opacidade e intermitencia, sem alterar a posicao, a escala ou a proporcao do outline.

O SVG final deve permanecer exatamente sobreposto ao titulo original: mesma posicao, mesma proporcao e mesma largura relativa. O fluxo padrao nao pode aplicar `scale`, `scaleX`, `scaleY`, `translate`, `transform`, offsets ou redimensionamento posterior aos paths.

Se o discovery identificar divergencia entre o texto medido e o outline gerado, o processo deve parar e registrar a divergencia. Nao e permitido publicar o SVG desalinhado para depois corrigi-lo manualmente no CSS.

## Observacao tecnica

Nos scripts de geracao, a variavel `scale` usada para converter unidades internas da fonte para pixels durante a extracao e uma conversao de unidade, nao uma distorcao do outline. Depois que os paths sao gerados, nenhuma transformacao geometrica deve ser aplicada.

## Uso planejado

```jsx
<NeonText target="#creative-label" effect="active" />
```

Ou, em markup ja preparado:

```html
<span id="creative-label" class="neon-text neon-text--active">
  CREATIVE
</span>
```

`neon-text--active` nunca deve tentar inferir a geometria sozinho. O componente precisa receber ou localizar o SVG pre-processado correspondente ao elemento e a fonte resolvida.
