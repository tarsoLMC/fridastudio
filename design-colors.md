# Arquitetura de cores da Frida Studio

O marfim rosado cria uma base acolhedora para a leitura e deixa o tom de pele, os fios e a textura das fotos em evidência. O vinho pontua a experiência com a profundidade de um batom clássico. Usá-lo nos agendamentos e nos estados ativos ajuda a cliente a identificar o próximo passo enquanto explora sobrancelhas, cílios, lábios, maquiagem e face.

A composição segue a proporção 60–30–10. O marfim cobre a maior parte da página, os tons secundários estruturam cards e seções, e o vinho ocupa até 10% da interface. A diferença de luminosidade OKLCH entre o fundo e os cards é de 4,01 pontos percentuais. Os neutros usam o mesmo matiz do vinho com cromaticidade baixa. A página usa uma apresentação clara com uma superfície escura localizada.

## Tokens

```css
:root {
  color-scheme: light;
  --bg-canvas: #fcf0f2;
  --bg-surface: #efe2e4;
  --bg-surface-hover: #e8dadd;
  --border-subtle: #d9cbcd;
  --border-strong: #722e41;
  --text-primary: #2a2123;
  --text-secondary: #4a3f41;
  --text-muted: #615557;
  --accent-primary: #722e41;
  --accent-primary-hover: #572130;
  --accent-contrast: #fff7f8;
  --bg-inverse: #2a2123;
  --text-inverse: #fff7f8;
  --text-inverse-secondary: #d6c8ca;
  --border-inverse: #847779;
  --bg-marker: #f3dde1;
  --image-placeholder: #e2d4d6;
}

@supports (color: oklch(0% 0 0)) {
  :root {
    --bg-canvas: oklch(96.439% 0.01304 5.09);
    --bg-surface: oklch(92.430% 0.01500 5.09);
    --bg-surface-hover: oklch(90.075% 0.01600 5.09);
    --border-subtle: oklch(85.331% 0.01600 5.09);
    --border-strong: oklch(40.217% 0.09781 5.09);
    --text-primary: oklch(25.907% 0.01500 5.09);
    --text-secondary: oklch(37.876% 0.01600 5.09);
    --text-muted: oklch(46.244% 0.01600 5.09);
    --accent-primary: oklch(40.217% 0.09781 5.09);
    --accent-primary-hover: oklch(33.245% 0.08168 5.09);
    --accent-contrast: oklch(98.209% 0.00900 5.09);
    --bg-inverse: oklch(25.907% 0.01500 5.09);
    --text-inverse: oklch(98.209% 0.00900 5.09);
    --text-inverse-secondary: oklch(84.404% 0.01600 5.09);
    --border-inverse: oklch(58.163% 0.01600 5.09);
    --bg-marker: oklch(91.703% 0.02400 5.09);
    --image-placeholder: oklch(88.186% 0.01600 5.09);
  }
}
```

## Aplicação

| Área | Aplicação dos tokens |
| --- | --- |
| Hero | `--bg-canvas` como fundo, `--text-primary` no título, `--text-secondary` na descrição e `--image-placeholder` durante o carregamento da fotografia. |
| Cards | `--bg-surface` como fundo, `--bg-surface-hover` na interação, `--border-subtle` em divisores decorativos e `--text-muted` em legendas. `--bg-marker` destaca opções e informações de apoio. |
| CTAs | `--accent-primary` nos botões de agendamento e nos indicadores ativos. `--accent-primary-hover` no hover, `--accent-contrast` no texto do botão e `--border-strong` no foco em fundo claro. |
| Rodapé | `--bg-inverse` como fundo, `--text-inverse` nos títulos, links principais e foco, `--text-inverse-secondary` nos dados de contato e `--border-inverse` nos divisores. |

## Contraste

Razões calculadas com a luminância relativa WCAG a partir dos valores sRGB. As versões OKLCH representam as mesmas cores, com arredondamento.

| Combinação | Razão |
| --- | ---: |
| Título sobre o fundo principal | 14,09:1 |
| Título sobre cards | 12,44:1 |
| Título sobre cards em hover | 11,57:1 |
| Título sobre a superfície de destaque | 12,12:1 |
| Descrição sobre o fundo principal | 9,09:1 |
| Descrição sobre cards | 8,02:1 |
| Descrição sobre cards em hover | 7,46:1 |
| Descrição sobre a superfície de destaque | 7,81:1 |
| Legenda sobre fundo, cards, hover e destaque | 5,26:1 a 6,41:1 |
| Texto do CTA em repouso e hover | 9,12:1 e 11,96:1 |
| Foco em fundo claro, cards e superfície de destaque | 7,10:1 a 8,65:1 |
| Texto principal e secundário no rodapé | 14,86:1 e 9,68:1 |
| Borda sobre o fundo escuro | 3,65:1 |
